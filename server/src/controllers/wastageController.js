
import mongoose from 'mongoose';
import Wastage from '../models/Wastage.js';
import Product from '../models/Product.js';
import RawMaterial from '../models/RawMaterial.js';
import Branch from '../models/Branch.js';
import StockMovement from '../models/StockMovement.js';
import { notifyBranchUsers } from '../services/notificationService.js';

const allowedReasons = [
  'Expired',
  'Spoiled',
  'Overproduction',
  'Preparation Error',
  'Damaged',
  'Other'
];

const roundMoney = value =>
  Math.round((value + Number.EPSILON) * 100) / 100;

// CREATE WASTAGE
export const createWastage = async (req, res) => {
  let session;

  try {
    const {
      wastageNumber,
      branchId,
      items,
      notes,
      wastageDate
    } = req.body;

    if (
      !wastageNumber ||
      !branchId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide wastage number, branch and items.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID.'
      });
    }

    if (
      !['OWNER', 'BRANCH_MANAGER', 'FRANCHISE_MANAGER'].includes(
        req.user.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to record wastage.'
      });
    }

    if (
      req.user.role !== 'OWNER' &&
      String(req.user.branchId) !== String(branchId)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot record wastage for another branch.'
      });
    }

    if (
      wastageDate &&
      Number.isNaN(new Date(wastageDate).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wastage date.'
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.'
      });
    }

    for (const item of items) {
      const itemType = item.itemType || 'PRODUCT';

      const validId =
        itemType === 'PRODUCT'
          ? mongoose.Types.ObjectId.isValid(item.productId)
          : itemType === 'RAW_MATERIAL'
            ? mongoose.Types.ObjectId.isValid(item.rawMaterialId)
            : false;

      if (
        !validId ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0 ||
        !allowedReasons.includes(item.reason)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item type, item ID, quantity or reason.'
        });
      }
    }

    session = await mongoose.startSession();

    let createdWastage;

    await session.withTransaction(async () => {
      const wastageItems = [];
      const movementRecords = [];
      let totalLoss = 0;

      for (const item of items) {
        const itemType = item.itemType || 'PRODUCT';
        const quantity = Number(item.quantity);

        let inventoryItem;
        let previousStock;
        let updatedItem;
        let unitCost;
        let itemName;
        let movementReference;

        if (itemType === 'PRODUCT') {
          inventoryItem = await Product.findOne({
            _id: item.productId,
            branchId
          }).session(session);

          if (!inventoryItem) {
            throw new Error('PRODUCT_NOT_FOUND');
          }

          previousStock = Number(inventoryItem.stock);
          unitCost = Number(inventoryItem.cost);
          itemName = inventoryItem.name;

          updatedItem = await Product.findOneAndUpdate(
            {
              _id: inventoryItem._id,
              branchId,
              stock: { $gte: quantity }
            },
            {
              $inc: { stock: -quantity }
            },
            {
              new: true,
              session
            }
          );

          movementReference = {
            productId: inventoryItem._id,
            rawMaterialId: null
          };

        } else {
          inventoryItem = await RawMaterial.findOne({
            _id: item.rawMaterialId,
            branchId,
            isActive: true
          }).session(session);

          if (!inventoryItem) {
            throw new Error('RAW_MATERIAL_NOT_FOUND');
          }

          previousStock = Number(inventoryItem.currentStock);
          unitCost = Number(inventoryItem.purchasePrice);
          itemName = inventoryItem.name;

          updatedItem = await RawMaterial.findOneAndUpdate(
            {
              _id: inventoryItem._id,
              branchId,
              isActive: true,
              currentStock: { $gte: quantity }
            },
            {
              $inc: { currentStock: -quantity }
            },
            {
              new: true,
              session
            }
          );

          movementReference = {
            productId: null,
            rawMaterialId: inventoryItem._id
          };
        }

        if (!updatedItem) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        if (!Number.isFinite(unitCost) || unitCost < 0) {
          throw new Error('INVALID_ITEM_COST');
        }

        const itemLoss = roundMoney(quantity * unitCost);
        totalLoss += itemLoss;

        wastageItems.push({
          itemType,
          ...movementReference,
          productName: itemName,
          quantity,
          unitCost,
          totalLoss: itemLoss,
          reason: item.reason
        });

        movementRecords.push({
          ...movementReference,
          branchId,
          movementType: 'WASTAGE',
          quantity,
          previousStock,
          newStock:
            itemType === 'PRODUCT'
              ? updatedItem.stock
              : updatedItem.currentStock,
          performedBy: req.user._id,
          notes: `Wastage ${wastageNumber}: ${item.reason}`
        });
      }

      totalLoss = roundMoney(totalLoss);

      const [wastage] = await Wastage.create([{
        wastageNumber: wastageNumber.trim(),
        branchId,
        items: wastageItems,
        totalLoss,
        wastageDate: wastageDate || new Date(),
        reportedBy: req.user._id,
        notes: notes || ''
      }], { session });

      createdWastage = wastage;

      const movements = movementRecords.map(record => ({
        ...record,
        referenceId: wastage._id
      }));

      await StockMovement.create(movements, { session });
    });

    // Send notifications only after the database transaction commits.
    try {
      await notifyBranchUsers({
        branchId,
        type: 'WASTAGE',
        severity: 'WARNING',
        title: 'New wastage recorded',
        message: `Wastage ${wastageNumber} recorded at ${branch.name}. Total loss: ₹${createdWastage.totalLoss}.`,
        entityType: 'Wastage',
        entityId: createdWastage._id,
        metadata: {
          wastageNumber: createdWastage.wastageNumber,
          totalLoss: createdWastage.totalLoss,
          itemCount: createdWastage.items.length
        }
      });
    } catch (notificationError) {
      console.error(
        'Wastage notification error:',
        notificationError.message
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Wastage recorded and inventory updated successfully.',
      wastage: createdWastage
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Wastage number already exists.'
      });
    }

    const errors = {
      PRODUCT_NOT_FOUND: [404, 'Product not found in this branch.'],
      RAW_MATERIAL_NOT_FOUND: [404, 'Raw material not found in this branch.'],
      INSUFFICIENT_STOCK: [400, 'Insufficient stock for this wastage entry.'],
      INVALID_ITEM_COST: [400, 'The inventory item has an invalid cost.']
    };

    if (errors[error.message]) {
      const [status, message] = errors[error.message];

      return res.status(status).json({
        success: false,
        message
      });
    }

    console.error('Create Wastage Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to record wastage.',
      error: error.message
    });

  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


// GET ALL WASTAGE RECORDS
export const getWastages = async (req, res) => {
  try {
    const query = {};

    if (req.user.role === 'OWNER') {
      // Owner can view all branches.
    } else if (
      ['BRANCH_MANAGER', 'FRANCHISE_MANAGER'].includes(req.user.role)
    ) {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: 'No branch assigned to your account.'
        });
      }

      query.branchId = req.user.branchId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view wastage records.'
      });
    }

    if (req.query.branchId && req.user.role === 'OWNER') {
      if (!mongoose.Types.ObjectId.isValid(req.query.branchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid branch ID.'
        });
      }

      query.branchId = req.query.branchId;
    }

    if (req.query.from || req.query.to) {
      query.wastageDate = {};

      if (req.query.from) {
        query.wastageDate.$gte = new Date(req.query.from);
      }

      if (req.query.to) {
        const toDate = new Date(req.query.to);
        toDate.setHours(23, 59, 59, 999);
        query.wastageDate.$lte = toDate;
      }

      if (
        Object.values(query.wastageDate).some(date =>
          Number.isNaN(date.getTime())
        )
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date filter.'
        });
      }
    }

    const wastages = await Wastage.find(query)
      .populate('branchId', 'name city')
      .populate('reportedBy', 'name email')
      .populate('items.productId', 'name sku unit')
      .populate('items.rawMaterialId', 'name sku unit')
      .sort({ wastageDate: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: wastages.length,
      wastages
    });

  } catch (error) {
    console.error('Get Wastages Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wastage records.'
    });
  }
};


// GET SINGLE WASTAGE RECORD
export const getWastageById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wastage ID.'
      });
    }

    const query = { _id: req.params.id };

    if (req.user.role !== 'OWNER') {
      if (
        !['BRANCH_MANAGER', 'FRANCHISE_MANAGER'].includes(req.user.role) ||
        !req.user.branchId
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this record.'
        });
      }

      query.branchId = req.user.branchId;
    }

    const wastage = await Wastage.findOne(query)
      .populate('branchId', 'name city')
      .populate('reportedBy', 'name email')
      .populate('items.productId', 'name sku unit')
      .populate('items.rawMaterialId', 'name sku unit');

    if (!wastage) {
      return res.status(404).json({
        success: false,
        message: 'Wastage record not found.'
      });
    }

    return res.status(200).json({
      success: true,
      wastage
    });

  } catch (error) {
    console.error('Get Wastage Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch wastage record.'
    });
  }
};

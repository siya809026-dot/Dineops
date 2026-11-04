
import mongoose from 'mongoose';
import Purchase from '../models/Purchase.js';
import GoodsReceipt from '../models/GoodsReceipt.js';
import Product from '../models/Product.js';
import RawMaterial from '../models/RawMaterial.js';
import Branch from '../models/Branch.js';
import StockMovement from '../models/StockMovement.js';
import { notifyBranchUsers } from '../services/notificationService.js';

const MANAGER_ROLES = ['BRANCH_MANAGER', 'FRANCHISE_MANAGER'];

function canAccessBranch(user, branchId) {
  return (
    user.role === 'OWNER' ||
    String(user.branchId) === String(branchId)
  );
}

function getBranchQuery(user) {
  if (user.role === 'OWNER') return {};

  if (MANAGER_ROLES.includes(user.role) && user.branchId) {
    return { branchId: user.branchId };
  }

  return null;
}

async function sendPurchaseNotification(notificationData) {
  try {
    await notifyBranchUsers(notificationData);
  } catch (error) {
    console.error('Purchase notification error:', error.message);
  }
}

// CREATE PURCHASE ORDER — DOES NOT UPDATE STOCK
export const createPurchase = async (req, res) => {
  try {
    const {
      purchaseNumber,
      branchId,
      supplierName,
      items,
      paymentStatus,
      notes
    } = req.body;

    if (
      !purchaseNumber?.trim() ||
      !branchId ||
      !supplierName?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required purchase details.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID.'
      });
    }

    if (
      paymentStatus &&
      !['Paid', 'Pending', 'Partial'].includes(paymentStatus)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status.'
      });
    }

    if (!canAccessBranch(req.user, branchId)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot create purchases for another branch.'
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.'
      });
    }

    const purchaseItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const itemType = item.itemType || 'PRODUCT';
      const quantity = Number(item.quantity);
      const unitCost = Number(item.unitCost);

      if (
        !['PRODUCT', 'RAW_MATERIAL'].includes(itemType) ||
        !Number.isFinite(quantity) ||
        !Number.isFinite(unitCost) ||
        quantity <= 0 ||
        unitCost < 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid item type, quantity or unit cost.'
        });
      }

      let itemDocument;

      if (itemType === 'PRODUCT') {
        if (!mongoose.Types.ObjectId.isValid(item.productId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid product ID.'
          });
        }

        itemDocument = await Product.findOne({
          _id: item.productId,
          branchId
        });

      } else {
        if (!mongoose.Types.ObjectId.isValid(item.rawMaterialId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid raw material ID.'
          });
        }

        itemDocument = await RawMaterial.findOne({
          _id: item.rawMaterialId,
          branchId
        });
      }

      if (!itemDocument) {
        return res.status(404).json({
          success: false,
          message: `${itemType === 'PRODUCT' ? 'Product' : 'Raw material'} not found in this branch.`
        });
      }

      const lineTotal = quantity * unitCost;

      const purchaseItem = {
        itemType,
        itemName: itemDocument.name,
        quantity,
        receivedQuantity: 0,
        unitCost,
        lineTotal
      };

      if (itemType === 'PRODUCT') {
        purchaseItem.productId = itemDocument._id;
      } else {
        purchaseItem.rawMaterialId = itemDocument._id;
      }

      purchaseItems.push(purchaseItem);
      totalAmount += lineTotal;
    }

    const purchase = await Purchase.create({
      purchaseNumber: purchaseNumber.trim(),
      branchId,
      supplierName: supplierName.trim(),
      items: purchaseItems,
      totalAmount,
      purchaseStatus: 'ORDERED',
      paymentStatus: paymentStatus || 'Pending',
      workflowVersion: 2,
      createdBy: req.user._id,
      notes: notes || ''
    });

    await sendPurchaseNotification({
      branchId,
      type: 'PURCHASE',
      severity: 'INFO',
      title: 'New purchase order created',
      message: `Purchase ${purchase.purchaseNumber} has been created for supplier ${purchase.supplierName}. Total: ₹${purchase.totalAmount}.`,
      entityType: 'Purchase',
      entityId: purchase._id,
      metadata: {
        purchaseNumber: purchase.purchaseNumber,
        supplierName: purchase.supplierName,
        totalAmount: purchase.totalAmount,
        itemCount: purchase.items.length,
        purchaseStatus: purchase.purchaseStatus
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Purchase order created. Inventory will update after goods are received.',
      purchase
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Purchase number already exists.'
      });
    }

    console.error('Create Purchase Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create purchase order.',
      error: error.message
    });
  }
};


// RECEIVE GOODS — CREATE GRN AND UPDATE STOCK
export const createGoodsReceipt = async (req, res) => {
  let session;

  try {
    const { id } = req.params;
    const { grnNumber, items, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase ID.'
      });
    }

    if (
      !grnNumber?.trim() ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'GRN number and at least one received item are required.'
      });
    }

    if (items.some(item => !mongoose.Types.ObjectId.isValid(item.purchaseItemId))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase item ID.'
      });
    }

    const itemIds = items.map(item => String(item.purchaseItemId));

    if (new Set(itemIds).size !== itemIds.length) {
      return res.status(400).json({
        success: false,
        message: 'The same purchase item cannot appear twice in one GRN.'
      });
    }

    session = await mongoose.startSession();

    let createdReceipt;
    let updatedPurchase;

    await session.withTransaction(async () => {
      const purchase = await Purchase.findById(id).session(session);

      if (!purchase) {
        throw new Error('PURCHASE_NOT_FOUND');
      }

      if (!canAccessBranch(req.user, purchase.branchId)) {
        throw new Error('BRANCH_ACCESS_DENIED');
      }

      if (
        purchase.purchaseStatus === 'CANCELLED' ||
        purchase.purchaseStatus === 'RECEIVED'
      ) {
        throw new Error('PURCHASE_NOT_RECEIVABLE');
      }

      const receiptItems = [];
      const movementRecords = [];
      let receiptTotal = 0;

      for (const receivedItem of items) {
        const purchaseItem = purchase.items.id(
          receivedItem.purchaseItemId
        );

        if (!purchaseItem) {
          throw new Error('PURCHASE_ITEM_NOT_FOUND');
        }

        if (
          !purchaseItem.itemName ||
          !purchaseItem.itemType
        ) {
          throw new Error('LEGACY_PURCHASE');
        }

        const receivedQuantity = Number(
          receivedItem.receivedQuantity
        );

        if (
          !Number.isFinite(receivedQuantity) ||
          receivedQuantity <= 0
        ) {
          throw new Error('INVALID_RECEIVED_QUANTITY');
        }

        const remainingQuantity =
          purchaseItem.quantity - purchaseItem.receivedQuantity;

        if (receivedQuantity > remainingQuantity) {
          throw new Error('RECEIVED_QUANTITY_EXCEEDED');
        }

        let stockDocument;
        let previousStock;
        let newStock;

        if (purchaseItem.itemType === 'PRODUCT') {
          stockDocument = await Product.findOne({
            _id: purchaseItem.productId,
            branchId: purchase.branchId
          }).session(session);

          if (!stockDocument) {
            throw new Error('STOCK_ITEM_NOT_FOUND');
          }

          previousStock = Number(stockDocument.stock || 0);

          const updated = await Product.findOneAndUpdate(
            {
              _id: purchaseItem.productId,
              branchId: purchase.branchId
            },
            {
              $inc: { stock: receivedQuantity }
            },
            {
              new: true,
              session
            }
          );

          if (!updated) throw new Error('STOCK_UPDATE_FAILED');

          newStock = updated.stock;

          movementRecords.push({
            productId: stockDocument._id,
            branchId: purchase.branchId,
            movementType: 'PURCHASE',
            quantity: receivedQuantity,
            previousStock,
            newStock,
            performedBy: req.user._id,
            notes: `GRN ${grnNumber.trim()}`
          });

        } else if (purchaseItem.itemType === 'RAW_MATERIAL') {
          stockDocument = await RawMaterial.findOne({
            _id: purchaseItem.rawMaterialId,
            branchId: purchase.branchId
          }).session(session);

          if (!stockDocument) {
            throw new Error('STOCK_ITEM_NOT_FOUND');
          }

          previousStock = Number(stockDocument.currentStock || 0);

          const updated = await RawMaterial.findOneAndUpdate(
            {
              _id: purchaseItem.rawMaterialId,
              branchId: purchase.branchId
            },
            {
              $inc: { currentStock: receivedQuantity }
            },
            {
              new: true,
              session
            }
          );

          if (!updated) throw new Error('STOCK_UPDATE_FAILED');

          newStock = updated.currentStock;

          movementRecords.push({
            rawMaterialId: stockDocument._id,
            branchId: purchase.branchId,
            movementType: 'PURCHASE',
            quantity: receivedQuantity,
            previousStock,
            newStock,
            performedBy: req.user._id,
            notes: `GRN ${grnNumber.trim()}`
          });

        } else {
          throw new Error('INVALID_PURCHASE_ITEM_TYPE');
        }

        purchaseItem.receivedQuantity += receivedQuantity;

        const lineTotal =
          receivedQuantity * purchaseItem.unitCost;

        receiptTotal += lineTotal;

        receiptItems.push({
          purchaseItemId: purchaseItem._id,
          itemType: purchaseItem.itemType,
          productId: purchaseItem.productId || null,
          rawMaterialId: purchaseItem.rawMaterialId || null,
          itemName: purchaseItem.itemName,
          orderedQuantity: purchaseItem.quantity,
          receivedQuantity,
          unitCost: purchaseItem.unitCost,
          lineTotal
        });
      }

      const allReceived = purchase.items.every(
        item =>
          item.itemName &&
          Number(item.receivedQuantity || 0) >= Number(item.quantity)
      );

      const anyReceived = purchase.items.some(
        item => Number(item.receivedQuantity || 0) > 0
      );

      purchase.purchaseStatus = allReceived
        ? 'RECEIVED'
        : anyReceived
          ? 'PARTIALLY_RECEIVED'
          : 'ORDERED';

      await purchase.save({ session });

      const [receipt] = await GoodsReceipt.create([{
        grnNumber: grnNumber.trim(),
        purchaseId: purchase._id,
        branchId: purchase.branchId,
        supplierName: purchase.supplierName,
        items: receiptItems,
        totalAmount: receiptTotal,
        receivedBy: req.user._id,
        notes: notes || ''
      }], { session });

      createdReceipt = receipt;
      updatedPurchase = purchase;

      const recordsWithReference = movementRecords.map(record => ({
        ...record,
        referenceId: receipt._id
      }));

      await StockMovement.create(recordsWithReference, { session });
    });

    // Notify only after the GRN and stock transaction commits.
    const branch = await Branch.findById(updatedPurchase.branchId);

    await sendPurchaseNotification({
      branchId: updatedPurchase.branchId,
      type: 'PURCHASE',
      severity: 'SUCCESS',
      title: 'Goods received successfully',
      message: `GRN ${createdReceipt.grnNumber} recorded for purchase ${updatedPurchase.purchaseNumber}. Received value: ₹${createdReceipt.totalAmount}.`,
      entityType: 'GoodsReceipt',
      entityId: createdReceipt._id,
      metadata: {
        grnNumber: createdReceipt.grnNumber,
        purchaseNumber: updatedPurchase.purchaseNumber,
        supplierName: updatedPurchase.supplierName,
        receivedValue: createdReceipt.totalAmount,
        purchaseStatus: updatedPurchase.purchaseStatus,
        branchName: branch?.name || ''
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Goods received successfully. Inventory updated.',
      receipt: createdReceipt,
      purchase: updatedPurchase
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'GRN number already exists.'
      });
    }

    const errors = {
      PURCHASE_NOT_FOUND: [404, 'Purchase not found.'],
      BRANCH_ACCESS_DENIED: [403, 'You cannot receive goods for another branch.'],
      PURCHASE_NOT_RECEIVABLE: [400, 'This purchase cannot receive more goods.'],
      PURCHASE_ITEM_NOT_FOUND: [404, 'Purchase item not found.'],
      LEGACY_PURCHASE: [400, 'This is a historical purchase and cannot use the new GRN workflow.'],
      INVALID_RECEIVED_QUANTITY: [400, 'Received quantity must be greater than zero.'],
      RECEIVED_QUANTITY_EXCEEDED: [400, 'Received quantity exceeds the remaining ordered quantity.'],
      STOCK_ITEM_NOT_FOUND: [404, 'The linked product or raw material was not found.'],
      STOCK_UPDATE_FAILED: [409, 'Stock could not be updated.'],
      INVALID_PURCHASE_ITEM_TYPE: [400, 'Invalid purchase item type.']
    };

    const knownError = errors[error.message];

    if (knownError) {
      return res.status(knownError[0]).json({
        success: false,
        message: knownError[1]
      });
    }

    console.error('Create GRN Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to receive goods.',
      error: error.message
    });

  } finally {
    if (session) await session.endSession();
  }
};


// GET ALL PURCHASE ORDERS
export const getPurchases = async (req, res) => {
  try {
    const query = getBranchQuery(req.user);

    if (!query) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view purchases.'
      });
    }

    const purchases = await Purchase.find(query)
      .populate('branchId', 'name city')
      .populate('createdBy', 'name email')
      .populate('items.productId', 'name sku unit')
      .populate('items.rawMaterialId', 'name sku unit')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      purchases
    });

  } catch (error) {
    console.error('Get Purchases Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases.'
    });
  }
};


// GET SINGLE PURCHASE ORDER
export const getPurchaseById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase ID.'
      });
    }

    const branchQuery = getBranchQuery(req.user);

    if (!branchQuery) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this purchase.'
      });
    }

    const purchase = await Purchase.findOne({
      _id: req.params.id,
      ...branchQuery
    })
      .populate('branchId', 'name city')
      .populate('createdBy', 'name email')
      .populate('items.productId', 'name sku unit')
      .populate('items.rawMaterialId', 'name sku unit');

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found.'
      });
    }

    return res.status(200).json({
      success: true,
      purchase
    });

  } catch (error) {
    console.error('Get Purchase Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch purchase.'
    });
  }
};


// GET GOODS RECEIPTS
export const getGoodsReceipts = async (req, res) => {
  try {
    const branchQuery = getBranchQuery(req.user);

    if (!branchQuery) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view goods receipts.'
      });
    }

    const receipts = await GoodsReceipt.find(branchQuery)
      .populate('purchaseId', 'purchaseNumber purchaseStatus')
      .populate('branchId', 'name city')
      .populate('receivedBy', 'name email')
      .sort({ receivedDate: -1 });

    return res.status(200).json({
      success: true,
      count: receipts.length,
      receipts
    });

  } catch (error) {
    console.error('Get GRNs Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch goods receipts.'
    });
  }
};


// GET ONE GOODS RECEIPT
export const getGoodsReceiptById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid GRN ID.'
      });
    }

    const branchQuery = getBranchQuery(req.user);

    if (!branchQuery) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this GRN.'
      });
    }

    const receipt = await GoodsReceipt.findOne({
      _id: req.params.id,
      ...branchQuery
    })
      .populate('purchaseId', 'purchaseNumber purchaseStatus')
      .populate('branchId', 'name city')
      .populate('receivedBy', 'name email');

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: 'Goods receipt not found.'
      });
    }

    return res.status(200).json({
      success: true,
      receipt
    });

  } catch (error) {
    console.error('Get GRN Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch goods receipt.'
    });
  }
};


import mongoose from 'mongoose';
import StockTransfer from '../models/StockTransfer.js';
import Branch from '../models/Branch.js';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import { notifyBranchUsers } from '../services/notificationService.js';

const allowedRoles = ['OWNER', 'BRANCH_MANAGER', 'FRANCHISE_MANAGER'];

const canAccessBranch = (user, branchId) => {
  if (user.role === 'OWNER') return true;

  return (
    user.branchId &&
    String(user.branchId) === String(branchId)
  );
};

const sendTransferNotification = async (notificationData) => {
  try {
    await notifyBranchUsers(notificationData);
  } catch (error) {
    console.error('Stock transfer notification error:', error.message);
  }
};

// CREATE STOCK TRANSFER
export const createStockTransfer = async (req, res) => {
  try {
    const {
      transferNumber,
      sourceBranchId,
      destinationBranchId,
      items,
      notes
    } = req.body;

    if (
      !transferNumber ||
      !sourceBranchId ||
      !destinationBranchId ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required transfer details.'
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(sourceBranchId) ||
      !mongoose.Types.ObjectId.isValid(destinationBranchId) ||
      String(sourceBranchId) === String(destinationBranchId)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid source or destination branch.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create transfers.'
      });
    }

    if (!canAccessBranch(req.user, sourceBranchId)) {
      return res.status(403).json({
        success: false,
        message: 'You cannot transfer stock from this branch.'
      });
    }

    const [source, destination] = await Promise.all([
      Branch.findById(sourceBranchId),
      Branch.findById(destinationBranchId)
    ]);

    if (!source || !destination) {
      return res.status(404).json({
        success: false,
        message: 'Source or destination branch not found.'
      });
    }

    if (
      source.type !== 'Branch Kitchen' ||
      destination.type !== 'Franchise Outlet' ||
      String(destination.parentBranchId) !== String(source._id)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Stock can only be transferred from a parent Branch Kitchen to its assigned Franchise Outlet.'
      });
    }

    const productMap = new Map();

    for (const item of items) {
      if (
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product or transfer quantity.'
        });
      }

      const id = String(item.productId);

      productMap.set(
        id,
        (productMap.get(id) || 0) + Number(item.quantity)
      );
    }

    const transferItems = [];

    for (const [productId, quantity] of productMap) {
      const product = await Product.findOne({
        _id: productId,
        branchId: sourceBranchId
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'A product was not found in the source branch.'
        });
      }

      transferItems.push({
        productId: product._id,
        productName: product.name,
        quantity,
        unitCost: product.cost
      });
    }

    const transfer = await StockTransfer.create({
      transferNumber,
      sourceBranchId,
      destinationBranchId,
      items: transferItems,
      createdBy: req.user._id,
      notes: notes || '',
      status: 'Pending'
    });

    await sendTransferNotification({
      branchId: destinationBranchId,
      type: 'STOCK_TRANSFER',
      severity: 'INFO',
      title: 'New stock transfer request',
      message: `Transfer ${transferNumber} has been requested from ${source.name}.`,
      entityType: 'StockTransfer',
      entityId: transfer._id,
      metadata: {
        transferNumber,
        sourceBranchName: source.name,
        destinationBranchName: destination.name,
        itemCount: transferItems.length,
        status: 'Pending'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Stock transfer request created successfully.',
      transfer
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Transfer number already exists.'
      });
    }

    console.error('Create Stock Transfer Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to create stock transfer.'
    });
  }
};


// DISPATCH STOCK TRANSFER
export const dispatchStockTransfer = async (req, res) => {
  let session;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transfer ID.'
      });
    }

    session = await mongoose.startSession();

    let updatedTransfer;

    await session.withTransaction(async () => {
      const transfer = await StockTransfer.findById(
        req.params.id
      ).session(session);

      if (!transfer) throw new Error('TRANSFER_NOT_FOUND');

      if (transfer.status !== 'Pending') {
        throw new Error('INVALID_TRANSFER_STATUS');
      }

      if (!canAccessBranch(req.user, transfer.sourceBranchId)) {
        throw new Error('ACCESS_DENIED');
      }

      const movementRecords = [];

      for (const item of transfer.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            branchId: transfer.sourceBranchId,
            stock: { $gte: item.quantity }
          },
          {
            $inc: { stock: -item.quantity }
          },
          {
            new: true,
            session
          }
        );

        if (!product) {
          throw new Error('INSUFFICIENT_STOCK');
        }

        movementRecords.push({
          productId: item.productId,
          branchId: transfer.sourceBranchId,
          movementType: 'TRANSFER',
          quantity: item.quantity,
          previousStock: product.stock + item.quantity,
          newStock: product.stock,
          performedBy: req.user._id,
          referenceId: transfer._id,
          notes: `Dispatched to ${transfer.destinationBranchId}`
        });
      }

      transfer.status = 'Dispatched';
      transfer.dispatchedAt = new Date();

      await transfer.save({ session });

      await StockMovement.create(movementRecords, { session });

      updatedTransfer = transfer;
    });

    const [source, destination] = await Promise.all([
      Branch.findById(updatedTransfer.sourceBranchId),
      Branch.findById(updatedTransfer.destinationBranchId)
    ]);

    await sendTransferNotification({
      branchId: updatedTransfer.destinationBranchId,
      type: 'STOCK_TRANSFER',
      severity: 'SUCCESS',
      title: 'Stock transfer dispatched',
      message: `Transfer ${updatedTransfer.transferNumber} has been dispatched from ${source?.name || 'the source branch'}.`,
      entityType: 'StockTransfer',
      entityId: updatedTransfer._id,
      metadata: {
        transferNumber: updatedTransfer.transferNumber,
        sourceBranchName: source?.name || '',
        destinationBranchName: destination?.name || '',
        status: 'Dispatched'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Transfer dispatched successfully.',
      transfer: updatedTransfer
    });

  } catch (error) {
    const statusMap = {
      TRANSFER_NOT_FOUND: 404,
      INVALID_TRANSFER_STATUS: 400,
      ACCESS_DENIED: 403,
      INSUFFICIENT_STOCK: 400
    };

    if (statusMap[error.message]) {
      return res.status(statusMap[error.message]).json({
        success: false,
        message: error.message
      });
    }

    console.error('Dispatch Transfer Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to dispatch transfer.'
    });

  } finally {
    if (session) await session.endSession();
  }
};


// RECEIVE STOCK TRANSFER
export const receiveStockTransfer = async (req, res) => {
  let session;

  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid transfer ID.'
      });
    }

    session = await mongoose.startSession();

    let updatedTransfer;

    await session.withTransaction(async () => {
      const transfer = await StockTransfer.findById(
        req.params.id
      ).session(session);

      if (!transfer) throw new Error('TRANSFER_NOT_FOUND');

      if (transfer.status !== 'Dispatched') {
        throw new Error('INVALID_TRANSFER_STATUS');
      }

      if (!canAccessBranch(req.user, transfer.destinationBranchId)) {
        throw new Error('ACCESS_DENIED');
      }

      const movementRecords = [];

      for (const item of transfer.items) {
        const sourceProduct = await Product.findById(
          item.productId
        )
          .select('sku')
          .session(session);

        if (!sourceProduct) {
          throw new Error('DESTINATION_PRODUCT_NOT_FOUND');
        }

        let destinationProduct = await Product.findOne({
          branchId: transfer.destinationBranchId,
          sku: sourceProduct.sku
        }).session(session);

        if (!destinationProduct) {
          throw new Error('DESTINATION_PRODUCT_NOT_FOUND');
        }

        const previousStock = destinationProduct.stock;

        destinationProduct = await Product.findOneAndUpdate(
          {
            _id: destinationProduct._id,
            branchId: transfer.destinationBranchId
          },
          {
            $inc: { stock: item.quantity }
          },
          {
            new: true,
            session
          }
        );

        movementRecords.push({
          productId: destinationProduct._id,
          branchId: transfer.destinationBranchId,
          movementType: 'TRANSFER',
          quantity: item.quantity,
          previousStock,
          newStock: destinationProduct.stock,
          performedBy: req.user._id,
          referenceId: transfer._id,
          notes: `Received from ${transfer.sourceBranchId}`
        });
      }

      transfer.status = 'Received';
      transfer.receivedAt = new Date();
      transfer.receivedBy = req.user._id;

      await transfer.save({ session });

      await StockMovement.create(movementRecords, { session });

      updatedTransfer = transfer;
    });

    const [source, destination] = await Promise.all([
      Branch.findById(updatedTransfer.sourceBranchId),
      Branch.findById(updatedTransfer.destinationBranchId)
    ]);

    await sendTransferNotification({
      branchId: updatedTransfer.sourceBranchId,
      type: 'STOCK_TRANSFER',
      severity: 'SUCCESS',
      title: 'Stock transfer received',
      message: `Transfer ${updatedTransfer.transferNumber} has been received by ${destination?.name || 'the destination branch'}.`,
      entityType: 'StockTransfer',
      entityId: updatedTransfer._id,
      metadata: {
        transferNumber: updatedTransfer.transferNumber,
        sourceBranchName: source?.name || '',
        destinationBranchName: destination?.name || '',
        status: 'Received'
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Stock received and destination inventory updated.',
      transfer: updatedTransfer
    });

  } catch (error) {
    const statusMap = {
      TRANSFER_NOT_FOUND: 404,
      INVALID_TRANSFER_STATUS: 400,
      ACCESS_DENIED: 403,
      DESTINATION_PRODUCT_NOT_FOUND: 404
    };

    if (statusMap[error.message]) {
      return res.status(statusMap[error.message]).json({
        success: false,
        message: error.message
      });
    }

    console.error('Receive Transfer Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to receive stock transfer.'
    });

  } finally {
    if (session) await session.endSession();
  }
};


// GET ALL STOCK TRANSFERS
export const getStockTransfers = async (req, res) => {
  try {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view transfers.'
      });
    }

    const query = {};

    if (req.user.role !== 'OWNER') {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: 'No branch assigned to your account.'
        });
      }

      query.$or = [
        { sourceBranchId: req.user.branchId },
        { destinationBranchId: req.user.branchId }
      ];
    }

    const transfers = await StockTransfer.find(query)
      .populate('sourceBranchId', 'name city')
      .populate('destinationBranchId', 'name city')
      .populate('createdBy', 'name email')
      .populate('receivedBy', 'name email')
      .populate('items.productId', 'name sku unit')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: transfers.length,
      transfers
    });

  } catch (error) {
    console.error('Get Stock Transfers Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch stock transfers.'
    });
  }
};

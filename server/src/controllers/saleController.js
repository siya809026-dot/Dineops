
import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import StockMovement from '../models/StockMovement.js';

// Create sale and deduct inventory safely
export const createSale = async (req, res) => {
  let session;

  try {
    session = await mongoose.startSession();

    const {
      invoiceNumber,
      branchId,
      items,
      paymentMethod,
      notes
    } = req.body;

    if (!invoiceNumber || !branchId || !items?.length || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Invoice number, branch, items and payment method are required.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID.'
      });
    }

    if (!['Cash', 'UPI', 'Card', 'Online'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method.'
      });
    }

    if (
      req.user.role !== 'OWNER' &&
      (!req.user.branchId ||
        String(req.user.branchId) !== String(branchId))
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot create sales for another branch.'
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.'
      });
    }

    // Combine duplicate product entries
    const quantities = new Map();

    for (const item of items) {
      if (
        !item.productId ||
        !mongoose.Types.ObjectId.isValid(item.productId) ||
        !Number.isFinite(Number(item.quantity)) ||
        Number(item.quantity) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID or quantity.'
        });
      }

      const id = String(item.productId);

      quantities.set(
        id,
        (quantities.get(id) || 0) + Number(item.quantity)
      );
    }

    const saleItems = [];
    const movementRecords = [];
    let totalAmount = 0;

    await session.withTransaction(async () => {
      for (const [productId, quantity] of quantities) {
        const product = await Product.findOne({
          _id: productId,
          branchId
        }).session(session);

        if (!product) {
          throw new Error('PRODUCT_NOT_FOUND');
        }

        if (
          !Number.isFinite(product.sellingPrice) ||
          product.sellingPrice < 0
        ) {
          throw new Error(`INVALID_SELLING_PRICE:${product.name}`);
        }

        const previousStock = product.stock;

        if (quantity > previousStock) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        }

        // Deduct stock safely
        const updatedProduct = await Product.findOneAndUpdate(
          {
            _id: productId,
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

        if (!updatedProduct) {
          throw new Error(`INSUFFICIENT_STOCK:${product.name}`);
        }

        const lineTotal = quantity * product.sellingPrice;
        totalAmount += lineTotal;

        saleItems.push({
          productId: product._id,
          productName: product.name,
          quantity,
          unitPrice: product.sellingPrice,
          lineTotal
        });

        movementRecords.push({
          productId: product._id,
          branchId,
          movementType: 'SALE',
          quantity,
          previousStock,
          newStock: updatedProduct.stock,
          performedBy: req.user._id,
          notes: `Stock deducted through invoice ${invoiceNumber}`
        });
      }

      // Create sale first to obtain its ID
      const [createdSale] = await Sale.create([{
        invoiceNumber,
        branchId,
        items: saleItems,
        totalAmount,
        paymentMethod,
        notes,
        createdBy: req.user._id
      }], { session });

      // Link every stock movement to the sale
      const movements = movementRecords.map(movement => ({
        ...movement,
        referenceId: createdSale._id
      }));

      await StockMovement.create(movements, { session });
    });

    return res.status(201).json({
      success: true,
      message: 'Sale created and inventory history updated successfully.',
      totalAmount
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Invoice number already exists.'
      });
    }

    if (error.message === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Product not found in this branch.'
      });
    }

    if (error.message.startsWith('INSUFFICIENT_STOCK:')) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock for ${error.message.split(':')[1]}.`
      });
    }

    if (error.message.startsWith('INVALID_SELLING_PRICE:')) {
      return res.status(400).json({
        success: false,
        message: `Valid selling price missing for ${error.message.split(':')[1]}.`
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message
    });

  } finally {
    if (session) {
      await session.endSession();
    }
  }
};


// Get sales according to user role
export const getSales = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'OWNER') {
      query = {};
    } else if (
      ['BRANCH_MANAGER', 'FRANCHISE_MANAGER', 'STAFF'].includes(req.user.role)
    ) {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: 'No branch assigned to this user.'
        });
      }

      query.branchId = req.user.branchId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view sales.'
      });
    }

    const sales = await Sale.find(query)
      .populate('branchId', 'name city type')
      .populate('createdBy', 'name email')
      .sort({ saleDate: -1 });

    return res.status(200).json({
      success: true,
      count: sales.length,
      sales
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// Get a single sale
export const getSaleById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid sale ID.'
      });
    }

    let query = { _id: req.params.id };

    if (req.user.role !== 'OWNER') {
      if (
        !['BRANCH_MANAGER', 'FRANCHISE_MANAGER', 'STAFF'].includes(req.user.role) ||
        !req.user.branchId
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this sale.'
        });
      }

      query.branchId = req.user.branchId;
    }

    const sale = await Sale.findOne(query)
      .populate('branchId', 'name city type')
      .populate('createdBy', 'name email');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Sale not found in your assigned branch.'
      });
    }

    return res.status(200).json({
      success: true,
      sale
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

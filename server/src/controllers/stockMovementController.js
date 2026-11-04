
import mongoose from 'mongoose';
import StockMovement from '../models/StockMovement.js';

// Get stock movement history
export const getStockMovements = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'OWNER') {
      query = {};
    } else if (req.user.role === 'BRANCH_MANAGER') {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: 'No branch assigned to this manager.'
        });
      }

      query.branchId = req.user.branchId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view stock history.'
      });
    }

    // Optional product filter
    if (req.query.productId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID.'
        });
      }

      query.productId = req.query.productId;
    }

    // Optional movement type filter
    if (req.query.movementType) {
      const allowedTypes = [
        'SALE',
        'PURCHASE',
        'WASTAGE',
        'ADJUSTMENT',
        'TRANSFER'
      ];

      if (!allowedTypes.includes(req.query.movementType)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid movement type.'
        });
      }

      query.movementType = req.query.movementType;
    }

    const movements = await StockMovement.find(query)
      .populate('productId', 'name sku unit')
      .populate('branchId', 'name city')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: movements.length,
      movements
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

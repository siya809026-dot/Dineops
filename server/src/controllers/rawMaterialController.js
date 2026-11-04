
import mongoose from 'mongoose';
import RawMaterial from '../models/RawMaterial.js';
import Branch from '../models/Branch.js';

// ========================================
// GET ALL RAW MATERIALS
// OWNER: All branches
// BRANCH_MANAGER: Assigned branch only
// ========================================

export const getRawMaterials = async (req, res) => {
  try {
    let query = { isActive: true };

    if (req.user.role === 'OWNER') {
      if (req.query.branchId) {
        if (!mongoose.Types.ObjectId.isValid(req.query.branchId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid branch ID.'
          });
        }

        query.branchId = req.query.branchId;
      }
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
        message: 'You do not have permission to view raw materials.'
      });
    }

    if (req.query.category) {
      query.category = req.query.category;
    }

    const rawMaterials = await RawMaterial.find(query)
      .populate('branchId', 'name city')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: rawMaterials.length,
      rawMaterials
    });

  } catch (error) {
    console.error('Get Raw Materials Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch raw materials.'
    });
  }
};

// ========================================
// GET SINGLE RAW MATERIAL
// ========================================

export const getRawMaterialById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid raw material ID.'
      });
    }

    let query = {
      _id: id,
      isActive: true
    };

    if (req.user.role === 'BRANCH_MANAGER') {
      if (!req.user.branchId) {
        return res.status(403).json({
          success: false,
          message: 'No branch assigned to this manager.'
        });
      }

      query.branchId = req.user.branchId;
    } else if (req.user.role !== 'OWNER') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this raw material.'
      });
    }

    const rawMaterial = await RawMaterial.findOne(query)
      .populate('branchId', 'name city');

    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found in your accessible branch.'
      });
    }

    return res.status(200).json({
      success: true,
      rawMaterial
    });

  } catch (error) {
    console.error('Get Raw Material Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch raw material.'
    });
  }
};

// ========================================
// CREATE RAW MATERIAL
// OWNER ONLY
// ========================================

export const createRawMaterial = async (req, res) => {
  try {
    const {
      sku,
      name,
      category,
      unit,
      currentStock,
      minimumStock,
      purchasePrice,
      branchId
    } = req.body;

    if (
      !sku ||
      !name ||
      !category ||
      !unit ||
      purchasePrice === undefined ||
      !branchId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required raw material details.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(branchId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID.'
      });
    }

    const branch = await Branch.findById(branchId);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.'
      });
    }

    const rawMaterial = await RawMaterial.create({
      sku,
      name,
      category,
      unit,
      currentStock: currentStock ?? 0,
      minimumStock: minimumStock ?? 5,
      purchasePrice,
      branchId
    });

    return res.status(201).json({
      success: true,
      message: 'Raw material created successfully.',
      rawMaterial
    });

  } catch (error) {
    console.error('Create Raw Material Error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This SKU is already registered for this branch.'
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========================================
// UPDATE RAW MATERIAL
// OWNER ONLY
// ========================================

export const updateRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid raw material ID.'
      });
    }

    const allowedFields = [
      'sku',
      'name',
      'category',
      'unit',
      'minimumStock',
      'purchasePrice'
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid raw material details provided for update.'
      });
    }

    const rawMaterial = await RawMaterial.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Raw material updated successfully.',
      rawMaterial
    });

  } catch (error) {
    console.error('Update Raw Material Error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This SKU is already registered for this branch.'
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========================================
// DELETE RAW MATERIAL
// OWNER ONLY
// SOFT DELETE
// ========================================

export const deleteRawMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid raw material ID.'
      });
    }

    const rawMaterial = await RawMaterial.findOneAndUpdate(
      { _id: id, isActive: true },
      { $set: { isActive: false } },
      {
        new: true
      }
    );

    if (!rawMaterial) {
      return res.status(404).json({
        success: false,
        message: 'Raw material not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Raw material deactivated successfully.',
      rawMaterial
    });

  } catch (error) {
    console.error('Delete Raw Material Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate raw material.'
    });
  }
};

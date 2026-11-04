
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';

const PRODUCT_VIEW_ROLES = [
  'OWNER',
  'BRANCH_MANAGER',
  'FRANCHISE_MANAGER',
  'STAFF'
];

const getAccessibleProductQuery = (user, requestedBranchId) => {
  if (!PRODUCT_VIEW_ROLES.includes(user.role)) {
    return {
      error: {
        status: 403,
        message: 'You do not have permission to view products.'
      }
    };
  }

  if (user.role === 'OWNER') {
    const query = {};

    if (requestedBranchId) {
      if (!mongoose.Types.ObjectId.isValid(requestedBranchId)) {
        return {
          error: {
            status: 400,
            message: 'Invalid branch ID.'
          }
        };
      }

      query.branchId = requestedBranchId;
    }

    return { query };
  }

  if (!user.branchId) {
    return {
      error: {
        status: 403,
        message: 'No branch assigned to your account.'
      }
    };
  }

  if (
    requestedBranchId &&
    requestedBranchId.toString() !== user.branchId.toString()
  ) {
    return {
      error: {
        status: 403,
        message: 'You cannot access products from another branch.'
      }
    };
  }

  return {
    query: { branchId: user.branchId }
  };
};

// ========================================
// GET ALL PRODUCTS
// OWNER: All products or selected branch
// OTHER ROLES: Assigned branch only
// ========================================

export const getProducts = async (req, res) => {
  try {
    const access = getAccessibleProductQuery(
      req.user,
      req.query.branchId
    );

    if (access.error) {
      return res.status(access.error.status).json({
        success: false,
        message: access.error.message
      });
    }

    const query = { ...access.query };

    if (req.query.location) {
      query.location = req.query.location;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products
    });

  } catch (error) {
    console.error('Get Products Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products.'
    });
  }
};

// ========================================
// GET SINGLE PRODUCT
// ========================================

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    const access = getAccessibleProductQuery(req.user);

    if (access.error) {
      return res.status(access.error.status).json({
        success: false,
        message: access.error.message
      });
    }

    const product = await Product.findOne({
      _id: id,
      ...access.query
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your accessible branch.'
      });
    }

    return res.status(200).json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Get Product Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product.'
    });
  }
};

// ========================================
// CREATE PRODUCT
// OWNER ONLY
// ========================================

export const createProduct = async (req, res) => {
  try {
    const {
      sku,
      name,
      category,
      unit,
      stock,
      minStock,
      cost,
      sellingPrice,
      location,
      branchId
    } = req.body;

    if (
      !sku || !name || !category || !unit ||
      cost === undefined || sellingPrice === undefined ||
      !location || !branchId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required product details.'
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

    const product = await Product.create({
      sku,
      name,
      category,
      unit,
      stock: stock ?? 0,
      minStock: minStock ?? 10,
      cost,
      sellingPrice,
      location,
      branchId
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      product
    });

  } catch (error) {
    console.error('Create Product Error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This SKU is already registered.'
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========================================
// UPDATE PRODUCT
// OWNER ONLY
// ========================================

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    const allowedFields = [
      'sku',
      'name',
      'category',
      'unit',
      'minStock',
      'cost',
      'sellingPrice',
      'location'
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
        message: 'No valid product details provided for update.'
      });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully.',
      product
    });

  } catch (error) {
    console.error('Update Product Error:', error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This SKU is already registered.'
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// ========================================
// DELETE PRODUCT
// OWNER ONLY
// ========================================

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID.'
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.'
      });
    }

    return res.status(409).json({
      success: false,
      message: 'Product deletion is temporarily disabled to protect historical inventory and sales records.'
    });

  } catch (error) {
    console.error('Delete Product Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete product.'
    });
  }
};


import mongoose from 'mongoose';
import Branch from '../models/Branch.js';
import User from '../models/User.js';

// Check which branches the logged-in user can access
const getAccessibleBranchQuery = (user) => {
  if (user.role === 'OWNER') {
    return {};
  }

  if (user.role === 'BRANCH_MANAGER') {
    return {
      $or: [
        { _id: user.branchId },
        { parentBranchId: user.branchId }
      ]
    };
  }

  return { _id: user.branchId };
};

// GET ALL BRANCHES
export const getBranches = async (req, res) => {
  try {
    const query = getAccessibleBranchQuery(req.user);

    const branches = await Branch.find(query)
      .populate('parentBranchId', 'name city')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: branches.length,
      branches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET SINGLE BRANCH
export const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID.'
      });
    }

    const branch = await Branch.findOne({
      _id: id,
      ...getAccessibleBranchQuery(req.user)
    }).populate('parentBranchId', 'name city');

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found or access denied.'
      });
    }

    res.status(200).json({
      success: true,
      branch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// CREATE BRANCH
export const createBranch = async (req, res) => {
  try {
    const {
      name,
      type,
      city,
      manager,
      phone,
      parentBranchId,
      status,
      inventoryStatus
    } = req.body;

    if (!name || !type || !city || !manager || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, type, city, manager and phone.'
      });
    }

    if (!['Branch Kitchen', 'Franchise Outlet'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch type.'
      });
    }

    let parentId = null;

    if (type === 'Franchise Outlet') {
      if (!parentBranchId) {
        return res.status(400).json({
          success: false,
          message: 'A franchise outlet must have a parent branch kitchen.'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(parentBranchId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent branch ID.'
        });
      }

      const parentBranch = await Branch.findById(parentBranchId);

      if (!parentBranch || parentBranch.type !== 'Branch Kitchen') {
        return res.status(400).json({
          success: false,
          message: 'Parent must be an existing Branch Kitchen.'
        });
      }

      parentId = parentBranch._id;
    } else if (parentBranchId) {
      return res.status(400).json({
        success: false,
        message: 'A Branch Kitchen cannot have a parent branch.'
      });
    }

    const branch = await Branch.create({
      name,
      type,
      city,
      manager,
      phone,
      parentBranchId: parentId,
      status: status || 'Operational',
      inventoryStatus: inventoryStatus || 'Optimal'
    });

    const populatedBranch = await Branch.findById(branch._id)
      .populate('parentBranchId', 'name city');

    res.status(201).json({
      success: true,
      message: 'Branch created successfully.',
      branch: populatedBranch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE BRANCH
export const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID.'
      });
    }

    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.'
      });
    }

    const {
      name,
      type,
      city,
      manager,
      phone,
      parentBranchId,
      status,
      inventoryStatus
    } = req.body;

    const updatedType = type || branch.type;

    if (!['Branch Kitchen', 'Franchise Outlet'].includes(updatedType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch type.'
      });
    }

    if (updatedType === 'Branch Kitchen') {
      const hasChildren = await Branch.exists({
        parentBranchId: branch._id
      });

      if (hasChildren) {
        return res.status(400).json({
          success: false,
          message: 'A branch with franchise outlets cannot be converted into a Franchise Outlet.'
        });
      }

      branch.parentBranchId = null;
    } else {
      const newParentId = parentBranchId || branch.parentBranchId;

      if (!newParentId) {
        return res.status(400).json({
          success: false,
          message: 'A franchise outlet must have a parent branch kitchen.'
        });
      }

      if (!mongoose.Types.ObjectId.isValid(newParentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent branch ID.'
        });
      }

      if (newParentId.toString() === branch._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'A branch cannot be its own parent.'
        });
      }

      const parentBranch = await Branch.findById(newParentId);

      if (!parentBranch || parentBranch.type !== 'Branch Kitchen') {
        return res.status(400).json({
          success: false,
          message: 'Parent must be an existing Branch Kitchen.'
        });
      }

      branch.parentBranchId = parentBranch._id;
    }

    branch.name = name ?? branch.name;
    branch.type = updatedType;
    branch.city = city ?? branch.city;
    branch.manager = manager ?? branch.manager;
    branch.phone = phone ?? branch.phone;
    branch.status = status ?? branch.status;
    branch.inventoryStatus = inventoryStatus ?? branch.inventoryStatus;

    await branch.save();

    const updatedBranch = await Branch.findById(branch._id)
      .populate('parentBranchId', 'name city');

    res.status(200).json({
      success: true,
      message: 'Branch updated successfully.',
      branch: updatedBranch
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE BRANCH
export const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid branch ID.'
      });
    }

    const branch = await Branch.findById(id);

    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found.'
      });
    }

    const hasChildren = await Branch.exists({
      parentBranchId: branch._id
    });

    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete this branch because franchise outlets are assigned to it.'
      });
    }

    const hasAssignedUsers = await User.exists({
      branchId: branch._id
    });

    if (hasAssignedUsers) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete this branch because users are assigned to it.'
      });
    }

    await branch.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Branch deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

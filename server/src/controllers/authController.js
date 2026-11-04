
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (
      !email ||
      !password ||
      typeof email !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email and password.'
      });
    }

    // Check JWT configuration
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured.');
    }

    // Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    // Verify credentials
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check account status
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is inactive. Contact the administrator.'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId
      }
    });

  } catch (error) {
    console.error('Login Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to login. Please try again.'
    });
  }
};

// GET LOGGED-IN USER PROFILE
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('branchId', 'name type city');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get Profile Error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch user profile.'
    });
  }
};

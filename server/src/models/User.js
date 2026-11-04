
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: [
      'OWNER',
      'BRANCH_MANAGER',
      'FRANCHISE_MANAGER',
      'STAFF'
    ],
    default: 'STAFF',
    required: true
  },

  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    default: null,
    index: true
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });


// Validate branch assignment
userSchema.pre('validate', function () {
  if (this.role === 'OWNER') {
    this.branchId = null;
  } else if (!this.branchId) {
    this.invalidate(
      'branchId',
      'A branch must be assigned to this user.'
    );
  }
});


// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

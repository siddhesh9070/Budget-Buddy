const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Food & Dining',
      'Transportation',
      'Shopping',
      'Entertainment',
      'Healthcare',
      'Education',
      'Housing',
      'Utilities',
      'Insurance',
      'Travel',
      'Personal Care',
      'Gifts',
      'Subscriptions',
      'Other'
    ]
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Budget amount cannot be negative']
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  alertThreshold: {
    type: Number,
    default: 80, // Alert when 80% of budget is used
    min: [0, 'Alert threshold cannot be negative'],
    max: [100, 'Alert threshold cannot exceed 100%']
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    email: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
budgetSchema.index({ user: 1, category: 1 });
budgetSchema.index({ user: 1, isActive: 1 });

// Virtual for budget usage percentage
budgetSchema.virtual('usagePercentage').get(function() {
  // This will be calculated in the controller
  return 0;
});

// Virtual for remaining budget
budgetSchema.virtual('remainingBudget').get(function() {
  // This will be calculated in the controller
  return this.amount;
});

// Ensure virtuals are serialized
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Budget', budgetSchema); 
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
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
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other'],
    default: 'Cash'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'],
    default: 'monthly'
  },
  location: {
    type: String,
    trim: true
  },
  receipt: {
    type: String // URL to receipt image
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
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ user: 1, date: 1 });

// Virtual for formatted amount
expenseSchema.virtual('formattedAmount').get(function() {
  return this.amount.toFixed(2);
});

// Ensure virtuals are serialized
expenseSchema.set('toJSON', { virtuals: true });
expenseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Expense', expenseSchema); 
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title is required and must be less than 100 characters'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category').isIn([
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare',
    'Education', 'Housing', 'Utilities', 'Insurance', 'Travel', 'Personal Care',
    'Gifts', 'Subscriptions', 'Other'
  ]).withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('paymentMethod').optional().isIn(['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      amount,
      category,
      description,
      date,
      paymentMethod,
      tags,
      isRecurring,
      recurringFrequency,
      location,
      receipt
    } = req.body;

    const expense = await Expense.create({
      user: req.user._id,
      title,
      amount,
      category,
      description,
      date: date || new Date(),
      paymentMethod: paymentMethod || 'Cash',
      tags: tags || [],
      isRecurring: isRecurring || false,
      recurringFrequency: recurringFrequency || 'monthly',
      location,
      receipt
    });

    // Check budget alerts
    const budget = await Budget.findOne({
      user: req.user._id,
      category,
      isActive: true
    });

    if (budget) {
      const currentMonthExpenses = await Expense.aggregate([
        {
          $match: {
            user: req.user._id,
            category,
            date: {
              $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      const totalSpent = currentMonthExpenses[0]?.total || 0;
      const usagePercentage = (totalSpent / budget.amount) * 100;

      if (usagePercentage >= budget.alertThreshold) {
        expense.budgetAlert = {
          message: `You've used ${usagePercentage.toFixed(1)}% of your ${category} budget`,
          threshold: budget.alertThreshold,
          usagePercentage
        };
      }
    }

    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses
// @desc    Get all expenses with filtering
// @access  Private
router.get('/', [
  query('category').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('minAmount').optional().isFloat({ min: 0 }),
  query('maxAmount').optional().isFloat({ min: 0 }),
  query('paymentMethod').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      paymentMethod,
      page = 1,
      limit = 20
    } = req.query;

    // Build filter object
    const filter = { user: req.user._id };

    if (category) filter.category = category;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = parseFloat(minAmount);
      if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
    }

    const skip = (page - 1) * limit;

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Expense.countDocuments(filter);

    res.json({
      expenses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get single expense
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update expense
// @access  Private
router.put('/:id', [
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be less than 100 characters'),
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('category').optional().isIn([
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare',
    'Education', 'Housing', 'Utilities', 'Insurance', 'Travel', 'Personal Care',
    'Gifts', 'Subscriptions', 'Other'
  ]).withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    Object.assign(expense, req.body);
    const updatedExpense = await expense.save();

    res.json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete expense
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense removed' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/expenses/stats/summary
// @desc    Get expense summary statistics
// @access  Private
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
    } else {
      // Default to current month
      dateFilter.$gte = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      dateFilter.$lt = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    }

    const stats = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: dateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' },
          averageExpense: { $avg: '$amount' },
          count: { $sum: 1 },
          minExpense: { $min: '$amount' },
          maxExpense: { $max: '$amount' }
        }
      }
    ]);

    const categoryStats = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: dateFilter
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    res.json({
      summary: stats[0] || {
        totalExpenses: 0,
        averageExpense: 0,
        count: 0,
        minExpense: 0,
        maxExpense: 0
      },
      categoryStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
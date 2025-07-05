const express = require('express');
const { body, validationResult } = require('express-validator');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', [
  body('category').isIn([
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare',
    'Education', 'Housing', 'Utilities', 'Insurance', 'Travel', 'Personal Care',
    'Gifts', 'Subscriptions', 'Other'
  ]).withMessage('Invalid category'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('period').optional().isIn(['weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
  body('alertThreshold').optional().isFloat({ min: 0, max: 100 }).withMessage('Alert threshold must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      category,
      amount,
      period = 'monthly',
      startDate,
      endDate,
      alertThreshold = 80,
      notifications
    } = req.body;

    // Check if budget already exists for this category
    const existingBudget = await Budget.findOne({
      user: req.user._id,
      category,
      isActive: true
    });

    if (existingBudget) {
      return res.status(400).json({ message: 'Budget already exists for this category' });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      amount,
      period,
      startDate: startDate || new Date(),
      endDate,
      alertThreshold,
      notifications: notifications || {
        enabled: true,
        email: false,
        push: true
      }
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error('Create budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/budgets
// @desc    Get all budgets with usage statistics
// @access  Private
router.get('/', async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.user._id,
      isActive: true
    }).sort({ category: 1 });

    // Calculate usage for each budget
    const budgetsWithUsage = await Promise.all(
      budgets.map(async (budget) => {
        const currentMonthExpenses = await Expense.aggregate([
          {
            $match: {
              user: req.user._id,
              category: budget.category,
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
        const remainingBudget = Math.max(0, budget.amount - totalSpent);

        return {
          ...budget.toObject(),
          usage: {
            totalSpent,
            usagePercentage: Math.round(usagePercentage * 100) / 100,
            remainingBudget: Math.round(remainingBudget * 100) / 100,
            isOverBudget: totalSpent > budget.amount,
            alertTriggered: usagePercentage >= budget.alertThreshold
          }
        };
      })
    );

    res.json(budgetsWithUsage);
  } catch (error) {
    console.error('Get budgets error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/budgets/:id
// @desc    Get single budget with detailed usage
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    // Get detailed usage statistics
    const currentMonthExpenses = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          category: budget.category,
          date: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            $lt: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
          average: { $avg: '$amount' }
        }
      }
    ]);

    const totalSpent = currentMonthExpenses[0]?.total || 0;
    const usagePercentage = (totalSpent / budget.amount) * 100;
    const remainingBudget = Math.max(0, budget.amount - totalSpent);

    // Get recent expenses for this category
    const recentExpenses = await Expense.find({
      user: req.user._id,
      category: budget.category
    })
    .sort({ date: -1 })
    .limit(10);

    const budgetWithDetails = {
      ...budget.toObject(),
      usage: {
        totalSpent,
        usagePercentage: Math.round(usagePercentage * 100) / 100,
        remainingBudget: Math.round(remainingBudget * 100) / 100,
        isOverBudget: totalSpent > budget.amount,
        alertTriggered: usagePercentage >= budget.alertThreshold,
        expenseCount: currentMonthExpenses[0]?.count || 0,
        averageExpense: currentMonthExpenses[0]?.average || 0
      },
      recentExpenses
    };

    res.json(budgetWithDetails);
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update budget
// @access  Private
router.put('/:id', [
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('period').optional().isIn(['weekly', 'monthly', 'yearly']).withMessage('Invalid period'),
  body('alertThreshold').optional().isFloat({ min: 0, max: 100 }).withMessage('Alert threshold must be between 0 and 100')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    Object.assign(budget, req.body);
    const updatedBudget = await budget.save();

    res.json(updatedBudget);
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete budget (soft delete)
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    budget.isActive = false;
    await budget.save();

    res.json({ message: 'Budget deactivated' });
  } catch (error) {
    console.error('Delete budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/budgets/alerts/check
// @desc    Check for budget alerts
// @access  Private
router.get('/alerts/check', async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.user._id,
      isActive: true,
      'notifications.enabled': true
    });

    const alerts = [];

    for (const budget of budgets) {
      const currentMonthExpenses = await Expense.aggregate([
        {
          $match: {
            user: req.user._id,
            category: budget.category,
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
        alerts.push({
          budgetId: budget._id,
          category: budget.category,
          budgetAmount: budget.amount,
          totalSpent,
          usagePercentage: Math.round(usagePercentage * 100) / 100,
          threshold: budget.alertThreshold,
          message: `You've used ${Math.round(usagePercentage * 100) / 100}% of your ${budget.category} budget`,
          severity: usagePercentage >= 100 ? 'critical' : 'warning'
        });
      }
    }

    res.json({ alerts });
  } catch (error) {
    console.error('Check alerts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
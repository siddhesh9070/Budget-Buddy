import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Target,
  TrendingUp,
  TrendingDown,
  Coins,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const CATEGORIES = [
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
  'Other',
];

const PERIODS = ['weekly', 'monthly', 'yearly'];

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [alerts, setAlerts] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    fetchBudgets();
    fetchAlerts();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/budgets');
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/budgets/alerts/check');
      setAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingBudget) {
        await axios.put(`/api/budgets/${editingBudget._id}`, data);
        toast.success('Budget updated successfully!');
      } else {
        await axios.post('/api/budgets', data);
        toast.success('Budget created successfully!');
      }
      
      setShowAddModal(false);
      setEditingBudget(null);
      reset();
      fetchBudgets();
      fetchAlerts();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await axios.delete(`/api/budgets/${id}`);
        toast.success('Budget deleted successfully!');
        fetchBudgets();
        fetchAlerts();
      } catch (error) {
        toast.error('Failed to delete budget');
      }
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    reset({
      category: budget.category,
      amount: budget.amount,
      period: budget.period,
      alertThreshold: budget.alertThreshold,
    });
    setShowAddModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getProgressColor = (usagePercentage, isOverBudget) => {
    if (isOverBudget) return 'bg-danger-500';
    if (usagePercentage >= 80) return 'bg-warning-500';
    return 'bg-success-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600">Set and manage your spending limits</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </button>
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center">
              <AlertTriangle className="h-5 w-5 text-warning-600 mr-2" />
              Budget Alerts
            </h3>
          </div>
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  alert.severity === 'critical'
                    ? 'bg-danger-50 border-danger-200'
                    : 'bg-warning-50 border-warning-200'
                }`}
              >
                <div className="flex items-center">
                  <AlertTriangle
                    className={`h-5 w-5 mr-3 ${
                      alert.severity === 'critical' ? 'text-danger-600' : 'text-warning-600'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      Budget: {formatCurrency(alert.budgetAmount)} | Spent:{' '}
                      {formatCurrency(alert.totalSpent)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budgets List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Your Budgets</h3>
          <p className="text-sm text-gray-500">
            {budgets.length} budget{budgets.length !== 1 ? 's' : ''} set
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets set</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first budget to start tracking your spending limits.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <div key={budget._id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {budget.category}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="text-danger-600 hover:text-danger-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Budget</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Spent</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(budget.usage?.totalSpent || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Remaining</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(budget.usage?.remainingBudget || budget.amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Usage</span>
                    <span className="text-sm font-medium">
                      {budget.usage?.usagePercentage?.toFixed(1) || 0}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                        budget.usage?.usagePercentage || 0,
                        budget.usage?.isOverBudget
                      )}`}
                      style={{
                        width: `${Math.min(budget.usage?.usagePercentage || 0, 100)}%`,
                      }}
                    ></div>
                  </div>

                  {budget.usage?.alertTriggered && (
                    <div className="flex items-center text-sm text-warning-600">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Alert triggered
                    </div>
                  )}

                  {budget.usage?.isOverBudget && (
                    <div className="flex items-center text-sm text-danger-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Over budget
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingBudget ? 'Edit Budget' : 'Add New Budget'}
              </h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className={`input ${errors.category ? 'border-danger-500' : ''}`}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-danger-600">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (INR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    {...register('amount', {
                      required: 'Amount is required',
                      min: { value: 0.01, message: 'Amount must be greater than 0' },
                    })}
                    className={`input ${errors.amount ? 'border-danger-500' : ''}`}
                    placeholder="0.00"
                  />
                  {errors.amount && (
                    <p className="mt-1 text-sm text-danger-600">{errors.amount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period
                  </label>
                  <select {...register('period')} className="input">
                    {PERIODS.map((period) => (
                      <option key={period} value={period}>
                        {period.charAt(0).toUpperCase() + period.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alert Threshold (%)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    {...register('alertThreshold', {
                      min: { value: 0, message: 'Threshold must be at least 0' },
                      max: { value: 100, message: 'Threshold cannot exceed 100' },
                    })}
                    className={`input ${errors.alertThreshold ? 'border-danger-500' : ''}`}
                    placeholder="80"
                    defaultValue="80"
                  />
                  {errors.alertThreshold && (
                    <p className="mt-1 text-sm text-danger-600">{errors.alertThreshold.message}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingBudget(null);
                      reset();
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingBudget ? 'Update' : 'Add'} Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;

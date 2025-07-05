import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Mail,
  Coins,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee (₹)', symbol: '₹' },
  { code: 'USD', name: 'US Dollar ($)', symbol: '$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'GBP', name: 'British Pound (£)', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar (C$)', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar (A$)', symbol: 'A$' },
];

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch('newPassword');

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget || 0,
        currency: user.currency || 'INR',
        notifications: {
          budgetAlerts: user.notifications?.budgetAlerts ?? true,
          emailNotifications: user.notifications?.emailNotifications ?? false,
        },
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      const result = await updateProfile(data);
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const currency = user?.currency || 'INR';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getCurrencySymbol = (currencyCode) => {
    const currency = CURRENCIES.find(c => c.code === currencyCode);
    return currency ? currency.symbol : '₹';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-secondary flex items-center"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    {...register('name', {
                      required: 'Name is required',
                      minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters',
                      },
                      maxLength: {
                        value: 50,
                        message: 'Name must be less than 50 characters',
                      },
                    })}
                    disabled={!isEditing}
                    className={`input ${errors.name ? 'border-danger-500' : ''} ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    disabled={!isEditing}
                    className={`input ${errors.email ? 'border-danger-500' : ''} ${
                      !isEditing ? 'bg-gray-50' : ''
                    }`}
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Budget
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      {getCurrencySymbol(watch('currency') || user?.currency || 'INR')}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('monthlyBudget', {
                        min: { value: 0, message: 'Budget cannot be negative' },
                      })}
                      disabled={!isEditing}
                      className={`input pl-8 ${errors.monthlyBudget ? 'border-danger-500' : ''} ${
                        !isEditing ? 'bg-gray-50' : ''
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.monthlyBudget && (
                    <p className="mt-1 text-sm text-danger-600">{errors.monthlyBudget.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    {...register('currency')}
                    disabled={!isEditing}
                    className={`input ${!isEditing ? 'bg-gray-50' : ''}`}
                  >
                    {CURRENCIES.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Password Change Section */}
              {isEditing && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Change Password
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          {...register('currentPassword')}
                          className="input pr-10"
                          placeholder="Enter current password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          {...register('newPassword', {
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters',
                            },
                          })}
                          className={`input pr-10 ${errors.newPassword ? 'border-danger-500' : ''}`}
                          placeholder="Enter new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="mt-1 text-sm text-danger-600">{errors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...register('confirmPassword', {
                            validate: (value) =>
                              !newPassword || value === newPassword || 'Passwords do not match',
                          })}
                          className={`input pr-10 ${errors.confirmPassword ? 'border-danger-500' : ''}`}
                          placeholder="Confirm new password"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-danger-600">{errors.confirmPassword.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Section */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Budget Alerts</p>
                      <p className="text-sm text-gray-500">
                        Get notified when you're approaching your budget limits
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('notifications.budgetAlerts')}
                        disabled={!isEditing}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">
                        Receive email updates about your spending
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('notifications.emailNotifications')}
                        disabled={!isEditing}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Account Summary */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <Coins className="h-5 w-5 mr-2" />
                Account Summary
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Monthly Budget</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(user?.monthlyBudget || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Currency</span>
                <span className="text-sm font-medium text-gray-900">
                  {user?.currency || 'INR'}
                </span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <User className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Edit Profile</p>
                    <p className="text-xs text-gray-500">Update your personal information</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => window.open('/budgets', '_self')}
                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center">
                  <Coins className="h-5 w-5 text-success-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Manage Budgets</p>
                    <p className="text-xs text-gray-500">Set and track spending limits</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

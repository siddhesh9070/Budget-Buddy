import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Calendar,
  Target,
  Coins,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const COLORS = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
  '#F43F5E',
  '#A855F7',
  '#0EA5E9',
];

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, budgetsRes, alertsRes] = await Promise.all([
          axios.get('/api/expenses/stats/summary'),
          axios.get('/api/budgets'),
          axios.get('/api/budgets/alerts/check'),
        ]);

        setStats(statsRes.data);
        setBudgets(budgetsRes.data);
        setAlerts(alertsRes.data.alerts);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const pieChartData = stats?.categoryStats?.map((item, index) => ({
    name: item._id,
    value: item.total,
    color: COLORS[index % COLORS.length],
  })) || [];

  const barChartData = stats?.categoryStats?.map((item, index) => ({
    category: item._id,
    amount: item.total,
    count: item.count,
    color: COLORS[index % COLORS.length],
  })) || [];

  const monthlyData = [
    { month: 'Jan', expenses: 1200 },
    { month: 'Feb', expenses: 1400 },
    { month: 'Mar', expenses: 1100 },
    { month: 'Apr', expenses: 1600 },
    { month: 'May', expenses: 1300 },
    { month: 'Jun', expenses: 1500 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Coins className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Expenses</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.summary?.totalExpenses || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCard className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats?.summary?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Expense</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(stats?.summary?.averageExpense || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Target className="h-8 w-8 text-danger-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Budget Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">{alerts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Distribution Pie Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expense Distribution</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Bar Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Expenses by Category</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="amount" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly Trend and Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Trend</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#3B82F6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Overview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Budget Overview</h3>
          </div>
          <div className="space-y-4">
            {budgets.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No budgets set. Create budgets to track your spending.
              </p>
            ) : (
              budgets.slice(0, 5).map((budget) => (
                <div key={budget._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{budget.category}</span>
                    <span className="text-sm text-gray-500">
                      {budget.usage?.usagePercentage?.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {formatCurrency(budget.usage?.totalSpent || 0)} / {formatCurrency(budget.amount)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatCurrency(budget.usage?.remainingBudget || 0)} left
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        budget.usage?.isOverBudget
                          ? 'bg-danger-500'
                          : budget.usage?.alertTriggered
                          ? 'bg-warning-500'
                          : 'bg-success-500'
                      }`}
                      style={{
                        width: `${Math.min(budget.usage?.usagePercentage || 0, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
    </div>
  );
};

export default Dashboard; 
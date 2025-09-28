"use client";

import { useState, useEffect } from "react";
// import { useUser } from "@clerk/nextjs"; // Temporarily disabled
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Plus,
  Upload,
  Download,
  AlertTriangle,
  Target,
  List,
  Grid3X3,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

function DashboardContent() {
  // const { user } = useUser(); // Temporarily disabled
  const [analytics, setAnalytics] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [recentTransactionsViewType, setRecentTransactionsViewType] = useState("card"); // "card" or "table"
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch analytics data
      const analyticsResponse = await fetch('/api/analytics');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        if (analyticsData.success) {
          const data = analyticsData.data;
          setAnalytics({
            totalIncome: data.totalIncome || 0,
            totalExpense: data.totalExpense || 0,
            netSavings: data.netSavings || 0,
            transactionCount: data.transactionCount || 0,
            accountsTotal: data.accountsTotal || 0,
            monthlyGrowth: 2.5 // Calculate this properly later
          });
          
          // Generate monthly data from transactions
          if (data.monthlyTransactions) {
            generateMonthlyData(data.monthlyTransactions);
          }
        } else {
          console.error('Analytics API error:', analyticsData.error);
        }
      }

      // Fetch recent transactions (limit to 5)
      const transactionsResponse = await fetch('/api/transactions');
      if (transactionsResponse.ok) {
        const transactionsData = await transactionsResponse.json();
        if (transactionsData.success) {
          const transactions = transactionsData.data.slice(0, 5).map(t => ({
            id: t.id,
            description: t.description,
            amount: t.category.type === 'INCOME' ? t.amount : -t.amount,
            category: t.category.name,
            date: t.date,
            account: t.account.name
          }));
          setRecentTransactions(transactions);
        }
      }

      // For now, keep budget data as mock since we haven't implemented budgets yet
      setBudgets([
        {
          id: 1,
          name: "Food & Dining",
          spent: 450,
          budget: 600,
          percentage: 75
        },
        {
          id: 2,
          name: "Transportation",
          spent: 180,
          budget: 200,
          percentage: 90
        },
        {
          id: 3,
          name: "Entertainment",
          spent: 120,
          budget: 300,
          percentage: 40
        }
      ]);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // If API calls fail, set default values
      setAnalytics({
        totalIncome: 0,
        totalExpense: 0,
        netSavings: 0,
        transactionCount: 0,
        accountsTotal: 0,
        monthlyGrowth: 0
      });
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Import currency formatter
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  // Helper function to generate monthly data from transactions
  const generateMonthlyData = (transactions) => {
    const monthlyMap = {};
    const now = new Date();
    
    // Initialize last 4 months
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString('default', { month: 'short' });
      monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0 };
    }
    
    // Process transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthKey = transactionDate.toLocaleString('default', { month: 'short' });
      
      if (monthlyMap[monthKey]) {
        if (transaction.category.type === 'INCOME') {
          monthlyMap[monthKey].income += transaction.amount;
        } else {
          monthlyMap[monthKey].expense += transaction.amount;
        }
      }
    });
    
    setMonthlyData(Object.values(monthlyMap));
  };

  // Handler functions for dashboard buttons
  const handleAddTransaction = () => {
    setShowAddTransactionModal(true);
  };

  const handleImportData = () => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Import functionality for "${file.name}" will be implemented soon!`);
      }
    };
    input.click();
  };

  const handleExportData = () => {
    // Export all transactions to CSV
    fetch('/api/transactions')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const csvContent = [
            ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount'].join(','),
            ...data.data.map(t => [
              new Date(t.date).toLocaleDateString(),
              `"${t.description}"`,
              t.category.name,
              t.account.name,
              t.category.type,
              t.amount
            ].join(','))
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', `financial_data_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      })
      .catch(error => console.error('Export failed:', error));
  };

  const handleTransactionSuccess = () => {
    fetchDashboardData(); // Refresh dashboard data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          {/* Temporarily use hardcoded name since Clerk is disabled */}
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Demo User!</h1>
          {/* Original with Clerk: <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1> */}
          <p className="text-muted-foreground">Here's your financial overview for today</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            className="flex items-center gap-2"
            onClick={handleAddTransaction}
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleImportData}
          >
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(analytics.accountsTotal)}
            </div>
            <p className="text-xs text-muted-foreground">
              +{analytics.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics.totalExpense)}
            </div>
            <p className="text-xs text-muted-foreground">
              -5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(analytics.netSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="income" fill="#00C49F" name="Income" />
                <Bar dataKey="expense" fill="#FF8042" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Budget Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{budget.name}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.budget)}
                  </span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      budget.percentage > 90 ? 'bg-red-500' : 
                      budget.percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center">
                  <Badge 
                    variant={budget.percentage > 90 ? 'destructive' : 
                            budget.percentage > 75 ? 'secondary' : 'default'}
                    className="text-xs"
                  >
                    {budget.percentage}% used
                  </Badge>
                  {budget.percentage > 90 && (
                    <div className="flex items-center gap-1 text-red-600">
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">Over budget!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{transaction.category}</span>
                      <span>•</span>
                      <span>{transaction.account}</span>
                      <span>•</span>
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className={`font-bold text-lg ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline">View All Transactions</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}
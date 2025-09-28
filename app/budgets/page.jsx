"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Edit, 
  Trash2,
  Calendar,
  DollarSign,
  Mail,
  X
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddBudgetModal from "@/components/modals/AddBudgetModal";

function BudgetsContent() {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(null);

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await fetch('/api/budgets');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBudgets(data.data);
        } else {
          console.error('API error:', data.error);
          setBudgets([]);
        }
      } else {
        console.error('Failed to fetch budgets');
        setBudgets([]);
      }
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    try {
      const response = await fetch(`/api/budgets?id=${budgetId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        fetchBudgets();
        setShowDeleteModal(false);
        setDeletingBudget(null);
      }
    } catch (error) {
      console.error('Failed to delete budget:', error);
    }
  };

  const handleBudgetSuccess = () => {
    fetchBudgets();
    setShowAddModal(false);
    setShowEditModal(false);
    setEditingBudget(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const getBudgetStatusColor = (status) => {
    switch (status) {
      case 'on-track':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'exceeded':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getBudgetStatusIcon = (status) => {
    switch (status) {
      case 'on-track':
        return CheckCircle;
      case 'warning':
        return AlertTriangle;
      case 'exceeded':
        return AlertTriangle;
      default:
        return Target;
    }
  };

  const getBudgetStatusText = (status) => {
    switch (status) {
      case 'on-track':
        return 'On Track';
      case 'warning':
        return 'Warning';
      case 'exceeded':
        return 'Exceeded';
      default:
        return 'Unknown';
    }
  };

  // Calculate summary statistics
  const totalBudgetAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const activeBudgets = budgets.filter(b => b.isActive).length;
  const exceededBudgets = budgets.filter(b => b.status === 'exceeded').length;

  // Chart data for budget vs spent
  const chartData = budgets.map(budget => ({
    name: budget.name.length > 15 ? budget.name.substring(0, 15) + '...' : budget.name,
    budget: budget.amount,
    spent: budget.spent,
    remaining: budget.remaining
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">Set spending limits and track your financial goals</p>
        </div>
        
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target className="h-4 w-4" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalBudgetAmount)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalBudgetAmount > 0 ? `${((totalSpent / totalBudgetAmount) * 100).toFixed(1)}% of budget` : '0% of budget'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Active Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeBudgets}
            </div>
            <p className="text-xs text-muted-foreground">
              {budgets.length} total budgets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Exceeded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {exceededBudgets}
            </div>
            <p className="text-xs text-muted-foreground">
              budgets over limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budgets List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Budgets ({budgets.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {budgets.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No budgets yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first budget to start tracking your spending goals
                  </p>
                  <Button onClick={() => setShowAddModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {budgets.map((budget) => {
                    const StatusIcon = getBudgetStatusIcon(budget.status);
                    const statusColor = getBudgetStatusColor(budget.status);
                    
                    return (
                      <div key={budget.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${statusColor}`}>
                              <StatusIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium">{budget.name}</h3>
                                {!budget.isActive && (
                                  <Badge variant="secondary" className="text-xs">Inactive</Badge>
                                )}
                                {budget.emailNotifications && (
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                )}
                                {!budget.emailNotifications && (
                                  <X className="h-3 w-3 text-muted-foreground" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {budget.category ? budget.category.name : 'All Categories'} • 
                                {budget.period} • 
                                <Calendar className="h-3 w-3 inline mx-1" />
                                {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right mr-4">
                              <div className="font-bold text-lg">
                                {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                              </div>
                              <Badge className={statusColor}>
                                {getBudgetStatusText(budget.status)}
                              </Badge>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingBudget(budget);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDeletingBudget(budget);
                                setShowDeleteModal(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{budget.progress.toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={Math.min(100, budget.progress)} 
                            className={`h-2 ${budget.status === 'exceeded' ? 'bg-red-100' : budget.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'}`}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Remaining: {formatCurrency(budget.remaining)}</span>
                            <span>{budget.progress >= 100 ? 'Over budget' : `${(100 - budget.progress).toFixed(1)}% left`}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget vs Spent Chart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Spent</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      interval={0}
                      fontSize={10}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                      fontSize={10}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${value.toLocaleString()}`, '']}
                      labelFormatter={(label) => `Budget: ${label}`}
                    />
                    <Bar dataKey="budget" fill="#3b82f6" name="Budget" />
                    <Bar dataKey="spent" fill="#f97316" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>No budget data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddBudgetModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleBudgetSuccess}
        categories={categories}
      />

      <AddBudgetModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingBudget(null);
        }}
        onSuccess={handleBudgetSuccess}
        editData={editingBudget}
        categories={categories}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle>Delete Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Are you sure you want to delete "{deletingBudget?.name}"? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingBudget(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteBudget(deletingBudget.id)}
                  className="flex-1"
                >
                  Delete Budget
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function BudgetsPage() {
  return (
    <DashboardLayout>
      <BudgetsContent />
    </DashboardLayout>
  );
}
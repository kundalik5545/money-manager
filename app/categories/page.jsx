"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderOpen, TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";

function CategoriesContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Calculate total amount for each category by fetching transactions
          const transactionsResponse = await fetch('/api/transactions');
          let transactionsByCategory = {};
          
          if (transactionsResponse.ok) {
            const transactionsData = await transactionsResponse.json();
            if (transactionsData.success) {
              transactionsByCategory = transactionsData.data.reduce((acc, t) => {
                const categoryId = t.categoryId;
                if (!acc[categoryId]) {
                  acc[categoryId] = { total: 0, count: 0 };
                }
                acc[categoryId].total += t.amount;
                acc[categoryId].count += 1;
                return acc;
              }, {});
            }
          }

          const formattedCategories = data.data.map(cat => ({
            id: cat.id,
            name: cat.name,
            type: cat.type,
            transactionCount: transactionsByCategory[cat.id]?.count || 0,
            totalAmount: transactionsByCategory[cat.id]?.total || 0,
            subcategories: cat.subcategories.map(sub => ({
              id: sub.id,
              name: sub.name,
              transactionCount: 0 // Would need to calculate this properly
            }))
          }));
          setCategories(formattedCategories);
        } else {
          console.error('API error:', data.error);
          setCategories([]);
        }
      } else {
        console.error('Failed to fetch categories');
        setCategories([]);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  // Separate income and expense categories
  const incomeCategories = categories.filter(cat => cat.type === 'INCOME');
  const expenseCategories = categories.filter(cat => cat.type === 'EXPENSE');

  // Chart data for spending by category
  const chartData = expenseCategories.map(cat => ({
    name: cat.name,
    amount: cat.totalAmount,
    transactions: cat.transactionCount
  })).sort((a, b) => b.amount - a.amount);

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
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Organize and track your income and expense categories</p>
        </div>
        
        <div className="flex gap-3">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Subcategory
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {categories.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {incomeCategories.length} income, {expenseCategories.length} expense
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(incomeCategories.reduce((sum, cat) => sum + cat.totalAmount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {incomeCategories.reduce((sum, cat) => sum + cat.transactionCount, 0)} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(expenseCategories.reduce((sum, cat) => sum + cat.totalAmount, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenseCategories.reduce((sum, cat) => sum + cat.transactionCount, 0)} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>All Categories ({categories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          category.type === 'INCOME' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                        }`}>
                          {category.type === 'INCOME' ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        
                        <div>
                          <p className="font-medium text-foreground">{category.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={category.type === 'INCOME' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {category.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {category.transactionCount} transactions
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`font-bold text-lg ${
                        category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(category.totalAmount)}
                      </div>
                    </div>

                    {/* Subcategories */}
                    {category.subcategories.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FolderOpen className="h-3 w-3" />
                          <span>Subcategories ({category.subcategories.length})</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                          {category.subcategories.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                              <span className="font-medium truncate">{sub.name}</span>
                              <Badge variant="outline" className="text-xs ml-2">
                                {sub.transactionCount}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Spending by Category Chart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#FF8042" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>No expense data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <DashboardLayout>
      <CategoriesContent />
    </DashboardLayout>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  FolderOpen, 
  TrendingUp, 
  TrendingDown, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  List,
  Grid3X3,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddCategoryModal from "@/components/modals/AddCategoryModal";

function CategoriesContent() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState("table"); // "table" or "card"
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddSubcategoryModal, setShowAddSubcategoryModal] = useState(false);
  const categoriesPerPage = 10;

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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate income and expense categories
  const incomeCategories = filteredCategories.filter(cat => cat.type === 'INCOME');
  const expenseCategories = filteredCategories.filter(cat => cat.type === 'EXPENSE');

  // Pagination logic for categories
  const totalPages = Math.ceil(filteredCategories.length / categoriesPerPage);
  const startIndex = (currentPage - 1) * categoriesPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, startIndex + categoriesPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Chart data for spending by category (fixed to show actual data)
  const chartData = expenseCategories
    .filter(cat => cat.totalAmount > 0) // Only show categories with actual spending
    .map(cat => ({
      name: cat.name,
      amount: cat.totalAmount,
      transactions: cat.transactionCount
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10); // Show top 10 categories

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
        
        <div className="flex flex-wrap gap-3">
          <Button 
            className="flex items-center gap-2"
            onClick={() => setShowAddCategoryModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowAddSubcategoryModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add Subcategory  
          </Button>
          
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewType === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("table")}
              className="rounded-r-none"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewType === "card" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewType("card")}
              className="rounded-l-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

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

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>All Categories ({filteredCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No categories found</p>
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewType === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium">Category</th>
                        <th className="text-left py-2 px-2 font-medium">Type</th>
                        <th className="text-left py-2 px-2 font-medium">Transactions</th>
                        <th className="text-left py-2 px-2 font-medium">Subcategories</th>
                        <th className="text-right py-2 px-2 font-medium">Amount</th>
                        <th className="text-center py-2 px-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedCategories.map((category) => (
                        <tr key={category.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-full ${
                                category.type === 'INCOME' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                              }`}>
                                {category.type === 'INCOME' ? (
                                  <TrendingUp className="h-4 w-4" />
                                ) : (
                                  <TrendingDown className="h-4 w-4" />
                                )}
                              </div>
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <Badge 
                              variant={category.type === 'INCOME' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {category.type}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {category.transactionCount}
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {category.subcategories.length}
                          </td>
                          <td className={`py-3 px-2 text-right font-bold ${
                            category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(category.totalAmount)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Card View */}
              {viewType === "card" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedCategories.map((category) => (
                    <Card key={category.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-full ${
                            category.type === 'INCOME' ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                          }`}>
                            {category.type === 'INCOME' ? (
                              <TrendingUp className="h-4 w-4" />
                            ) : (
                              <TrendingDown className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-foreground mb-2">
                          {category.name}
                        </h3>
                        
                        <div className="space-y-2 mb-3">
                          <Badge 
                            variant={category.type === 'INCOME' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {category.type}
                          </Badge>
                          
                          <p className="text-xs text-muted-foreground">
                            {category.transactionCount} transactions • {category.subcategories.length} subcategories
                          </p>
                        </div>
                        
                        <div className={`text-xl font-bold ${
                          category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(category.totalAmount)}
                        </div>

                        {/* Subcategories */}
                        {category.subcategories.length > 0 && (
                          <div className="mt-3 pt-3 border-t space-y-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <FolderOpen className="h-3 w-3" />
                              <span>Subcategories ({category.subcategories.length})</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {category.subcategories.slice(0, 3).map((sub) => (
                                <Badge key={sub.id} variant="outline" className="text-xs">
                                  {sub.name}
                                </Badge>
                              ))}
                              {category.subcategories.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{category.subcategories.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + categoriesPerPage, filteredCategories.length)} of {filteredCategories.length} categories
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Expense Categories Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
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

      {/* Category-wise Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Category-wise Income & Expense Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2 font-medium">Category</th>
                  <th className="text-center py-2 px-2 font-medium">Type</th>
                  <th className="text-right py-2 px-2 font-medium">Total Amount</th>
                  <th className="text-right py-2 px-2 font-medium">Transactions</th>
                  <th className="text-right py-2 px-2 font-medium">Avg per Transaction</th>
                </tr>
              </thead>
              <tbody>
                {[...incomeCategories, ...expenseCategories]
                  .filter(cat => cat.totalAmount > 0)
                  .sort((a, b) => b.totalAmount - a.totalAmount)
                  .map((category) => (
                    <tr key={category.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            category.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <span>{category.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <Badge 
                          variant={category.type === 'INCOME' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {category.type}
                        </Badge>
                      </td>
                      <td className={`py-3 px-2 text-right font-bold ${
                        category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(category.totalAmount)}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {category.transactionCount}
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground">
                        {category.transactionCount > 0 ? 
                          formatCurrency(category.totalAmount / category.transactionCount) : 
                          formatCurrency(0)
                        }
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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
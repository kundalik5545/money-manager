"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Upload,
  X
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AddTransactionModal from "@/components/modals/AddTransactionModal";
import AddIncomeModal from "@/components/modals/AddIncomeModal";
import AddExpenseModal from "@/components/modals/AddExpenseModal";

function TransactionsContent() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState("table"); // "table" or "card"
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddIncomeModal, setShowAddIncomeModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [filterType, setFilterType] = useState("ALL"); // "ALL", "INCOME", "EXPENSE"
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const transactionsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const formattedTransactions = data.data.map(t => ({
            id: t.id,
            description: t.description,
            amount: t.amount,
            category: t.category.name,
            subcategory: t.subcategory?.name || null,
            account: t.account.name,
            date: t.date,
            type: t.category.type
          }));
          setTransactions(formattedTransactions);
        } else {
          console.error('API error:', data.error);
          setTransactions([]);
        }
      } else {
        console.error('Failed to fetch transactions');
        setTransactions([]);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
      setTransactions([]);
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

  // Advanced filtering logic
  const filteredTransactions = transactions.filter(transaction => {
    // Text search
    const matchesSearch = !searchQuery || 
      transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.account.toLowerCase().includes(searchQuery.toLowerCase());

    // Type filter
    const matchesType = filterType === "ALL" || transaction.type === filterType;

    // Category filter
    const matchesCategory = !selectedCategory || transaction.category === selectedCategory;

    // Account filter
    const matchesAccount = !selectedAccount || transaction.account === selectedAccount;

    // Date range filter
    const matchesDateRange = (!dateRange.start || new Date(transaction.date) >= new Date(dateRange.start)) &&
                            (!dateRange.end || new Date(transaction.date) <= new Date(dateRange.end));

    return matchesSearch && matchesType && matchesCategory && matchesAccount && matchesDateRange;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage);
  const startIndex = (currentPage - 1) * transactionsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + transactionsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleTransactionSuccess = () => {
    fetchTransactions(); // Refresh the transactions list
  };

  const handleExport = () => {
    // Convert transactions to CSV format
    const csvContent = [
      // Header row
      ['Date', 'Description', 'Category', 'Account', 'Type', 'Amount'].join(','),
      // Data rows
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        `"${t.description}"`,
        t.category,
        t.account,
        t.type,
        t.amount
      ].join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterType("ALL");
    setSelectedCategory("");
    setSelectedAccount("");
    setDateRange({ start: "", end: "" });
    setCurrentPage(1);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const response = await fetch(`/api/transactions?id=${transactionId}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          fetchTransactions(); // Refresh the list
        }
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    // For now, just show an alert. We'll implement edit modal later
    alert(`Edit functionality for "${transaction.description}" will be implemented soon!`);
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage and track all your financial transactions</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Separate Income/Expense Buttons */}
          <Button 
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => setShowAddIncomeModal(true)}
          >
            <TrendingUp className="h-4 w-4" />
            Add Income
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 border-red-500 text-red-600 hover:bg-red-50"
            onClick={() => setShowAddExpenseModal(true)}
          >
            <TrendingDown className="h-4 w-4" />
            Add Expense
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowImportModal(true)}
          >
            <Plus className="h-4 w-4" />
            Import
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="ALL">All Types</option>
                <option value="INCOME">Income</option>
                <option value="EXPENSE">Expense</option>
              </select>
            </div>

            {/* Date Range */}
            <div>
              <Input
                type="date"
                placeholder="Start Date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="End Date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>

            {/* Reset Button */}
            <div>
              <Button 
                variant="outline" 
                onClick={handleResetFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <>
              {/* Table View */}
              {viewType === "table" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-2 font-medium">Date</th>
                        <th className="text-left py-2 px-2 font-medium">Description</th>
                        <th className="text-left py-2 px-2 font-medium">Category</th>
                        <th className="text-left py-2 px-2 font-medium">Account</th>
                        <th className="text-right py-2 px-2 font-medium">Amount</th>
                        <th className="text-center py-2 px-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                transaction.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span className="font-medium">{transaction.description}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex flex-col gap-1">
                              <Badge variant="outline" className="w-fit text-xs">
                                {transaction.category}
                              </Badge>
                              {transaction.subcategory && (
                                <Badge variant="secondary" className="w-fit text-xs">
                                  {transaction.subcategory}
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm text-muted-foreground">
                            {transaction.account}
                          </td>
                          <td className={`py-3 px-2 text-right font-bold ${
                            transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center justify-center gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditTransaction(transaction)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteTransaction(transaction.id)}
                              >
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
                  {paginatedTransactions.map((transaction) => (
                    <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-3 h-3 rounded-full ${
                            transaction.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditTransaction(transaction)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteTransaction(transaction.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="font-medium text-foreground mb-2 break-words">
                          {transaction.description}
                        </h3>
                        
                        <div className="space-y-2 mb-3">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {transaction.category}
                            </Badge>
                            {transaction.subcategory && (
                              <Badge variant="secondary" className="text-xs">
                                {transaction.subcategory}
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            {transaction.account} • {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className={`text-xl font-bold ${
                          transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + transactionsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
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

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <DashboardLayout>
      <TransactionsContent />
    </DashboardLayout>
  );
}
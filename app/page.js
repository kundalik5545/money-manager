"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight, Shield, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">FinanceHub</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Your <span className="text-blue-600">Financial Future</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Take control of your finances with our comprehensive personal finance dashboard. 
            Track expenses, set budgets, and achieve your financial goals with powerful insights and automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your money
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed to simplify your financial life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Smart Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get detailed insights into your spending patterns with interactive charts and reports. 
                  Track your progress towards financial goals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <CardTitle>Secure & Private</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your financial data is protected with bank-level encryption. 
                  We never share your personal information with third parties.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <CardTitle>Multi-User Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Perfect for individuals, couples, and families. 
                  Each user has their own secure dashboard and data.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already managing their money smarter with FinanceHub.
          </p>
          <Link href="/sign-up">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <BarChart3 className="h-6 w-6 text-blue-400 mr-2" />
              <span className="text-lg font-semibold">FinanceHub</span>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2024 FinanceHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
      
      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <Dialog open={true} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
              <DialogDescription>Update the transaction details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.01"
                  value={editingTransaction.amount}
                  onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingTransaction.description}
                  onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingTransaction.date}
                  onChange={(e) => setEditingTransaction({...editingTransaction, date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-account">Account</Label>
                <Select onValueChange={(value) => setEditingTransaction({...editingTransaction, accountId: value})} value={editingTransaction.accountId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.type.replace('_', ' ')})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select onValueChange={(value) => {
                  setEditingTransaction({...editingTransaction, categoryId: value, subcategoryId: ''})
                }} value={editingTransaction.categoryId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {editingTransaction.categoryId && getSubcategoriesForCategory(editingTransaction.categoryId).length > 0 && (
                <div>
                  <Label htmlFor="edit-subcategory">Subcategory (Optional)</Label>
                  <Select onValueChange={(value) => setEditingTransaction({...editingTransaction, subcategoryId: value === 'none' ? '' : value})} value={editingTransaction.subcategoryId || 'none'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No subcategory</SelectItem>
                      {getSubcategoriesForCategory(editingTransaction.categoryId).map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
                          {subcategory.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleEditTransaction} className="flex-1">
                  Update Transaction
                </Button>
                <Button variant="outline" onClick={() => setEditingTransaction(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Account Dialog */}
      {editingAccount && (
        <Dialog open={true} onOpenChange={() => setEditingAccount(null)}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Account</DialogTitle>
              <DialogDescription>Update the account details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-account-name">Account Name</Label>
                <Input
                  id="edit-account-name"
                  value={editingAccount.name}
                  onChange={(e) => setEditingAccount({...editingAccount, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-account-type">Account Type</Label>
                <Select onValueChange={(value) => setEditingAccount({...editingAccount, type: value})} value={editingAccount.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank Account</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-account-balance">Balance</Label>
                <Input
                  id="edit-account-balance"
                  type="number"
                  step="0.01"
                  value={editingAccount.balance}
                  onChange={(e) => setEditingAccount({...editingAccount, balance: e.target.value})}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditAccount} className="flex-1">
                  Update Account
                </Button>
                <Button variant="outline" onClick={() => setEditingAccount(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Edit Category Dialog */}
      {editingCategory && (
        <Dialog open={true} onOpenChange={() => setEditingCategory(null)}>
          <DialogContent className="max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Update the category details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-category-name">Category Name</Label>
                <Input
                  id="edit-category-name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-category-type">Category Type</Label>
                <Select onValueChange={(value) => setEditingCategory({...editingCategory, type: value})} value={editingCategory.type}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleEditCategory} className="flex-1">
                  Update Category
                </Button>
                <Button variant="outline" onClick={() => setEditingCategory(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.show} onOpenChange={(open) => setDeleteConfirm({...deleteConfirm, show: open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {deleteConfirm.type} "{deleteConfirm.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Income</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-green-600">
                {formatCurrency(analytics.totalIncome)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-red-600">
                {formatCurrency(analytics.totalExpense)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className={`text-xl lg:text-2xl font-bold ${
                analytics.netSavings >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(analytics.netSavings)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <Wallet className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">
                {analytics.transactionCount}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Charts */}
      {analytics && analytics.categoryBreakdown.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          {analytics.monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="income" fill="#00C49F" name="Income" />
                    <Bar dataKey="expense" fill="#FF8042" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Management Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Filters</CardTitle>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search - full width on mobile */}
                <div>
                  <Input
                    placeholder="🔍 Search transactions..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full"
                  />
                </div>
                
                {/* Filters in mobile-friendly grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                    <Select onValueChange={(value) => setFilters({...filters, categoryId: value === 'all' ? '' : value})}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Account</label>
                    <Select onValueChange={(value) => setFilters({...filters, accountId: value === 'all' ? '' : value})}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="All accounts" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All accounts</SelectItem>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">From Date</label>
                    <Input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">To Date</label>
                    <Input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Transactions Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Recent Transactions</CardTitle>
              <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                <Button
                  variant={transactionView === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTransactionView('card')}
                  className="h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={transactionView === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setTransactionView('table')}
                  className="h-8 px-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No transactions found</h3>
                    <p className="text-muted-foreground">Start by adding a transaction or importing data.</p>
                  </div>
                ) : (
                  <>
                    {/* Card View */}
                    {transactionView === 'card' && (
                      <div className="space-y-2">
                        {transactions.map((transaction) => (
                        <div key={transaction.id} className="border rounded-lg p-4 space-y-3">
                          {/* Mobile-first layout */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1 min-w-0">
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                                transaction.category.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-base break-words">{transaction.description}</p>
                                <div className="mt-1 space-y-1">
                                  <p className="text-sm text-muted-foreground">
                                    📱 {transaction.account.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    🏷️ {transaction.category.name}
                                    {transaction.subcategory && ` → ${transaction.subcategory.name}`}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    📅 {new Date(transaction.date).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-shrink-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setEditingTransaction({
                                    ...transaction,
                                    date: transaction.date.split('T')[0],
                                    subcategoryId: transaction.subcategory?.id || ''
                                  })
                                }}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => setDeleteConfirm({
                                    show: true,
                                    type: 'transaction',
                                    id: transaction.id,
                                    name: transaction.description
                                  })}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {/* Amount - prominent display */}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-sm font-medium text-muted-foreground">Amount</span>
                            <span className={`font-bold text-xl ${
                              transaction.category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.category.type === 'INCOME' ? '+' : ''}{formatCurrency(transaction.amount)}
                            </span>
                          </div>
                        </div>
                        ))}
                      </div>
                    )}

                    {/* Table View */}
                    {transactionView === 'table' && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-semibold">Description</th>
                              <th className="text-left py-3 px-4 font-semibold">Account</th>
                              <th className="text-left py-3 px-4 font-semibold">Category</th>
                              <th className="text-right py-3 px-4 font-semibold">Amount</th>
                              <th className="text-center py-3 px-4 font-semibold">Date</th>
                              <th className="text-center py-3 px-4 font-semibold">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((transaction) => (
                              <tr key={transaction.id} className="border-b hover:bg-muted/50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                      transaction.category.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                                    }`} />
                                    <span className="font-medium">{transaction.description}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="text-sm">{transaction.account.name}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex flex-col">
                                    <span className="text-sm">{transaction.category.name}</span>
                                    {transaction.subcategory && (
                                      <span className="text-xs text-muted-foreground">→ {transaction.subcategory.name}</span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <span className={`font-bold ${
                                    transaction.category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                                  }`}>
                                    {transaction.category.type === 'INCOME' ? '+' : ''}{formatCurrency(transaction.amount)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="text-sm text-muted-foreground">
                                    {new Date(transaction.date).toLocaleDateString()}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => {
                                        setEditingTransaction({
                                          ...transaction,
                                          date: transaction.date.split('T')[0],
                                          subcategoryId: transaction.subcategory?.id || ''
                                        })
                                      }}>
                                        <Edit2 className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem 
                                        className="text-red-600"
                                        onClick={() => setDeleteConfirm({
                                          show: true,
                                          type: 'transaction',
                                          id: transaction.id,
                                          name: transaction.description
                                        })}
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="w-full sm:w-auto"
                        >
                          ← Previous
                        </Button>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground whitespace-nowrap">
                            Page {currentPage} of {totalPages}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="w-full sm:w-auto"
                        >
                          Next →
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Account Name</label>
                    <Input
                      placeholder="Enter account name"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Account Type</label>
                    <Select onValueChange={(value) => setNewAccount({...newAccount, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BANK">🏦 Bank Account</SelectItem>
                        <SelectItem value="WALLET">👛 Wallet</SelectItem>
                        <SelectItem value="CREDIT_CARD">💳 Credit Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Initial Balance</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newAccount.balance}
                      onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateAccount} className="w-full sm:w-auto">
                  ➕ Add Account
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Your Accounts</CardTitle>
              <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                <Button
                  variant={accountView === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setAccountView('card')}
                  className="h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={accountView === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setAccountView('table')}
                  className="h-8 px-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Card View */}
              {accountView === 'card' && (
                <div className="space-y-2">
                {accounts.map((account) => (
                  <div key={account.id} className="border rounded-lg p-4 space-y-3">
                    {/* Header with name and actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          account.type === 'BANK' ? 'bg-blue-500' : 
                          account.type === 'WALLET' ? 'bg-green-500' : 'bg-orange-500'
                        }`} />
                        <h4 className="font-semibold text-base break-words flex-1">{account.name}</h4>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingAccount(account)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setDeleteConfirm({
                              show: true,
                              type: 'account',
                              id: account.id,
                              name: account.name
                            })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    {/* Account details */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <Badge variant="outline" className="text-xs">
                          {account.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Transactions</span>
                        <span className="text-sm font-medium">{account._count.transactions}</span>
                      </div>
                    </div>
                    
                    {/* Balance - prominent display */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium text-muted-foreground">Balance</span>
                      <span className={`font-bold text-xl ${
                        account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                  </div>
                ))}
                
                {/* Mobile-only totals for card view */}
                {accounts.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">Account Totals</h4>
                    <div className="space-y-3">
                      {/* Bank Accounts Total */}
                      {accounts.some(acc => acc.type === 'BANK') && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span className="font-medium text-blue-900">Bank Accounts</span>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(
                              accounts
                                .filter(acc => acc.type === 'BANK')
                                .reduce((sum, acc) => sum + acc.balance, 0)
                            )}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            {accounts.filter(acc => acc.type === 'BANK').length} account(s)
                          </div>
                        </div>
                      )}

                      {/* Wallet Total */}
                      {accounts.some(acc => acc.type === 'WALLET') && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span className="font-medium text-green-900">Wallets</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(
                              accounts
                                .filter(acc => acc.type === 'WALLET')
                                .reduce((sum, acc) => sum + acc.balance, 0)
                            )}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            {accounts.filter(acc => acc.type === 'WALLET').length} account(s)
                          </div>
                        </div>
                      )}

                      {/* Credit Cards Total */}
                      {accounts.some(acc => acc.type === 'CREDIT_CARD') && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-orange-500" />
                            <span className="font-medium text-orange-900">Credit Cards</span>
                          </div>
                          <div className="text-2xl font-bold text-orange-600">
                            {formatCurrency(
                              accounts
                                .filter(acc => acc.type === 'CREDIT_CARD')
                                .reduce((sum, acc) => sum + acc.balance, 0)
                            )}
                          </div>
                          <div className="text-xs text-orange-600 mt-1">
                            {accounts.filter(acc => acc.type === 'CREDIT_CARD').length} account(s)
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Grand Total */}
                    <div className="mt-4 pt-4 border-t border-dashed">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg">Total Net Worth</span>
                        <span className={`font-bold text-2xl ${
                          accounts.reduce((sum, acc) => sum + acc.balance, 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                </div>
              )}

              {/* Table View */}
              {accountView === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Account Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-right py-3 px-4 font-semibold">Balance</th>
                        <th className="text-center py-3 px-4 font-semibold">Transactions</th>
                        <th className="text-center py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {accounts.map((account) => (
                        <tr key={account.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                account.type === 'BANK' ? 'bg-blue-500' : 
                                account.type === 'WALLET' ? 'bg-green-500' : 'bg-orange-500'
                              }`} />
                              <span className="font-medium">{account.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              {account.type === 'BANK' ? '🏦 Bank Account' : 
                               account.type === 'WALLET' ? '👛 Wallet' : '💳 Credit Card'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className={`font-bold text-lg ${
                              account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatCurrency(account.balance)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm text-muted-foreground">
                              {account._count.transactions}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingAccount(account)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => setDeleteConfirm({
                                    show: true,
                                    type: 'account',
                                    id: account.id,
                                    name: account.name
                                  })}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {/* Account Totals by Type */}
                  {accounts.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                      <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wide">Account Totals</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Bank Accounts Total */}
                        {accounts.some(acc => acc.type === 'BANK') && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <span className="font-medium text-blue-900">Bank Accounts</span>
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {formatCurrency(
                                accounts
                                  .filter(acc => acc.type === 'BANK')
                                  .reduce((sum, acc) => sum + acc.balance, 0)
                              )}
                            </div>
                            <div className="text-xs text-blue-600 mt-1">
                              {accounts.filter(acc => acc.type === 'BANK').length} account(s)
                            </div>
                          </div>
                        )}

                        {/* Wallet Total */}
                        {accounts.some(acc => acc.type === 'WALLET') && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              <span className="font-medium text-green-900">Wallets</span>
                            </div>
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(
                                accounts
                                  .filter(acc => acc.type === 'WALLET')
                                  .reduce((sum, acc) => sum + acc.balance, 0)
                              )}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {accounts.filter(acc => acc.type === 'WALLET').length} account(s)
                            </div>
                          </div>
                        )}

                        {/* Credit Cards Total */}
                        {accounts.some(acc => acc.type === 'CREDIT_CARD') && (
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="w-3 h-3 rounded-full bg-orange-500" />
                              <span className="font-medium text-orange-900">Credit Cards</span>
                            </div>
                            <div className="text-2xl font-bold text-orange-600">
                              {formatCurrency(
                                accounts
                                  .filter(acc => acc.type === 'CREDIT_CARD')
                                  .reduce((sum, acc) => sum + acc.balance, 0)
                              )}
                            </div>
                            <div className="text-xs text-orange-600 mt-1">
                              {accounts.filter(acc => acc.type === 'CREDIT_CARD').length} account(s)
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Grand Total */}
                      <div className="mt-4 pt-4 border-t border-dashed">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-lg">Total Net Worth</span>
                          <span className={`font-bold text-2xl ${
                            accounts.reduce((sum, acc) => sum + acc.balance, 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Category Name</label>
                    <Input
                      placeholder="Enter category name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Category Type</label>
                    <Select onValueChange={(value) => setNewCategory({...newCategory, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INCOME">💰 Income</SelectItem>
                        <SelectItem value="EXPENSE">💸 Expense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateCategory} className="w-full sm:w-auto">
                  ➕ Add Category
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Add New Subcategory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Parent Category</label>
                    <Select onValueChange={(value) => setNewSubcategory({...newSubcategory, categoryId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.type === 'INCOME' ? '💰' : '💸'} {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Subcategory Name</label>
                    <Input
                      placeholder="Enter subcategory name"
                      value={newSubcategory.name}
                      onChange={(e) => setNewSubcategory({...newSubcategory, name: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateSubcategory} className="w-full sm:w-auto">
                  ➕ Add Subcategory
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Your Categories</CardTitle>
              <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
                <Button
                  variant={categoryView === 'card' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCategoryView('card')}
                  className="h-8 px-2"
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={categoryView === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCategoryView('table')}
                  className="h-8 px-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Card View */}
              {categoryView === 'card' && (
                <div className="space-y-4">
                  {categories.map((category) => (
                    <div key={category.id} className="border rounded-lg p-4 space-y-3">
                      {/* Header with category name and actions */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                            category.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-base break-words">{category.name}</h4>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant={category.type === 'INCOME' ? 'default' : 'secondary'} className="text-xs">
                                {category.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {category._count.transactions} transactions
                              </span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="flex-shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => setDeleteConfirm({
                                show: true,
                                type: 'category',
                                id: category.id,
                                name: category.name
                              })}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Subcategories */}
                      {category.subcategories.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Separator className="flex-1" />
                            <span className="text-xs text-muted-foreground px-2">Subcategories</span>
                            <Separator className="flex-1" />
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {category.subcategories.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                <span className="text-sm font-medium break-words flex-1">{sub.name}</span>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700 flex-shrink-0 ml-2"
                                  onClick={() => setDeleteConfirm({
                                    show: true,
                                    type: 'subcategory',
                                    id: sub.id,
                                    name: sub.name
                                  })}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Table View */}
              {categoryView === 'table' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold">Category Name</th>
                        <th className="text-left py-3 px-4 font-semibold">Type</th>
                        <th className="text-center py-3 px-4 font-semibold">Transactions</th>
                        <th className="text-left py-3 px-4 font-semibold">Subcategories</th>
                        <th className="text-center py-3 px-4 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category) => (
                        <tr key={category.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                category.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                              <span className="font-medium">{category.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={category.type === 'INCOME' ? 'default' : 'secondary'} className="text-xs">
                              {category.type === 'INCOME' ? '💰 Income' : '💸 Expense'}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-sm text-muted-foreground">
                              {category._count.transactions}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {category.subcategories.length > 0 ? (
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
                            ) : (
                              <span className="text-sm text-muted-foreground">None</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                                  <Edit2 className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => setDeleteConfirm({
                                    show: true,
                                    type: 'category',
                                    id: category.id,
                                    name: category.name
                                  })}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
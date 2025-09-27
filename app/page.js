'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Plus, Upload, DollarSign, TrendingUp, TrendingDown, Wallet, Edit2, Trash2, MoreHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function App() {
  const [accounts, setAccounts] = useState([])
  const [categories, setCategories] = useState([])
  const [transactions, setTransactions] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadData, setUploadData] = useState(null)
  const [columnMapping, setColumnMapping] = useState({})
  
  // Form states
  const [newAccount, setNewAccount] = useState({ name: '', type: 'BANK', balance: '' })
  const [newCategory, setNewCategory] = useState({ name: '', type: 'EXPENSE' })
  const [newSubcategory, setNewSubcategory] = useState({ name: '', categoryId: '' })
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: '',
    subcategoryId: ''
  })
  
  // Edit states
  const [editingTransaction, setEditingTransaction] = useState(null)
  const [editingAccount, setEditingAccount] = useState(null)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: '', name: '' })
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    categoryId: '',
    accountId: '',
    startDate: '',
    endDate: ''
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  // Fetch data
  const fetchData = async () => {
    try {
      const [accountsRes, categoriesRes, transactionsRes, analyticsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/categories'),
        fetch(`/api/transactions?page=${currentPage}&limit=10&${new URLSearchParams(filters)}`),
        fetch('/api/analytics')
      ])
      
      const [accountsData, categoriesData, transactionsData, analyticsData] = await Promise.all([
        accountsRes.json(),
        categoriesRes.json(),
        transactionsRes.json(),
        analyticsRes.json()
      ])
      
      if (accountsData.success) setAccounts(accountsData.data)
      if (categoriesData.success) setCategories(categoriesData.data)
      if (transactionsData.success) {
        setTransactions(transactionsData.data.transactions)
        setTotalPages(transactionsData.data.pages)
      }
      if (analyticsData.success) setAnalytics(analyticsData.data)
    } catch (error) {
      toast.error('Failed to fetch data')
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [currentPage, filters])
  
  // Create account
  const handleCreateAccount = async () => {
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAccount)
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success('Account created successfully')
        setNewAccount({ name: '', type: 'BANK', balance: '' })
        fetchData()
      } else {
        toast.error(data.error || 'Failed to create account')
      }
    } catch (error) {
      toast.error('Failed to create account')
    }
  }
  
  // Create category
  const handleCreateCategory = async () => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success('Category created successfully')
        setNewCategory({ name: '', type: 'EXPENSE' })
        fetchData()
      } else {
        toast.error(data.error || 'Failed to create category')
      }
    } catch (error) {
      toast.error('Failed to create category')
    }
  }

  // Create subcategory
  const handleCreateSubcategory = async () => {
    if (!newSubcategory.categoryId || !newSubcategory.name) {
      toast.error('Please select a category and enter subcategory name')
      return
    }
    
    try {
      const res = await fetch(`/api/categories/${newSubcategory.categoryId}/subcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubcategory.name })
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success('Subcategory created successfully')
        setNewSubcategory({ name: '', categoryId: '' })
        fetchData()
      } else {
        toast.error(data.error || 'Failed to create subcategory')
      }
    } catch (error) {
      toast.error('Failed to create subcategory')
    }
  }
  
  // Create transaction
  const handleCreateTransaction = async () => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success('Transaction created successfully')
        setNewTransaction({
          amount: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          accountId: '',
          categoryId: '',
          subcategoryId: ''
        })
        fetchData()
      } else {
        toast.error(data.error || 'Failed to create transaction')
      }
    } catch (error) {
      toast.error('Failed to create transaction')
    }
  }
  
  // Handle file upload
  const handleFileUpload = async () => {
    if (!selectedFile) return
    
    const formData = new FormData()
    formData.append('file', selectedFile)
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      if (data.success) {
        setUploadData(data.data)
        toast.success('File uploaded successfully')
      } else {
        toast.error(data.error || 'Failed to upload file')
      }
    } catch (error) {
      toast.error('Failed to upload file')
    }
  }
  
  // Handle import
  const handleImport = async () => {
    if (!uploadData || !columnMapping.amount || !columnMapping.description || !columnMapping.date) {
      toast.error('Please map all required columns')
      return
    }
    
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: uploadData.rawData,
          mapping: columnMapping,
          defaultAccountId: accounts[0]?.id,
          defaultCategoryId: categories.find(c => c.type === 'EXPENSE')?.id
        })
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success(`Imported ${data.data.imported} transactions`)
        setUploadData(null)
        setColumnMapping({})
        fetchData()
      } else {
        toast.error(data.error || 'Failed to import transactions')
      }
    } catch (error) {
      toast.error('Failed to import transactions')
    }
  }
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  
  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      search: '',
      categoryId: '',
      accountId: '',
      startDate: '',
      endDate: ''
    })
    setCurrentPage(1)
  }
  
  // Get subcategories for selected category
  const getSubcategoriesForCategory = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.subcategories : []
  }
  
  // Edit transaction
  const handleEditTransaction = async () => {
    try {
      const res = await fetch(`/api/transactions/${editingTransaction.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTransaction)
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success('Transaction updated successfully')
        setEditingTransaction(null)
        fetchData()
      } else {
        toast.error(data.error || 'Failed to update transaction')
      }
    } catch (error) {
      toast.error('Failed to update transaction')
    }
  }
  
  // Edit account
  const handleEditAccount = async () => {
    try {
      const res = await fetch(`/api/accounts/${editingAccount.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingAccount)
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success('Account updated successfully')
        setEditingAccount(null)
        fetchData()
      } else {
        toast.error(data.error || 'Failed to update account')
      }
    } catch (error) {
      toast.error('Failed to update account')
    }
  }
  
  // Edit category
  const handleEditCategory = async () => {
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategory)
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success('Category updated successfully')
        setEditingCategory(null)
        fetchData()
      } else {
        toast.error(data.error || 'Failed to update category')
      }
    } catch (error) {
      toast.error('Failed to update category')
    }
  }
  
  // Delete function
  const handleDelete = async () => {
    try {
      const endpoint = deleteConfirm.type === 'transaction' ? 'transactions' : 
                     deleteConfirm.type === 'account' ? 'accounts' : 
                     deleteConfirm.type === 'category' ? 'categories' : 'subcategories'
      
      const res = await fetch(`/api/${endpoint}/${deleteConfirm.id}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      if (data.success) {
        toast.success(`${deleteConfirm.type} deleted successfully`)
        setDeleteConfirm({ show: false, type: '', id: '', name: '' })
        fetchData()
      } else {
        toast.error(data.error || `Failed to delete ${deleteConfirm.type}`)
      }
    } catch (error) {
      toast.error(`Failed to delete ${deleteConfirm.type}`)
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Personal Finance Dashboard</h1>
          <p className="text-muted-foreground text-sm lg:text-base">Track your income, expenses, and manage your finances</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>Enter the transaction details below.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="account">Account</Label>
                  <Select onValueChange={(value) => setNewTransaction({...newTransaction, accountId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
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
                  <Label htmlFor="category">Category</Label>
                  <Select onValueChange={(value) => {
                    setNewTransaction({...newTransaction, categoryId: value, subcategoryId: ''})
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
                {newTransaction.categoryId && getSubcategoriesForCategory(newTransaction.categoryId).length > 0 && (
                  <div>
                    <Label htmlFor="subcategory">Subcategory (Optional)</Label>
                    <Select onValueChange={(value) => setNewTransaction({...newTransaction, subcategoryId: value === 'none' ? '' : value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No subcategory</SelectItem>
                        {getSubcategoriesForCategory(newTransaction.categoryId).map((subcategory) => (
                          <SelectItem key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button onClick={handleCreateTransaction} className="w-full">
                  Create Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2" />
                Import Data
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl mx-auto max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Import Transactions</DialogTitle>
                <DialogDescription>Upload an Excel or CSV file to import transactions.</DialogDescription>
              </DialogHeader>
              
              {!uploadData ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Select File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                  </div>
                  <Button onClick={handleFileUpload} disabled={!selectedFile}>
                    Upload & Preview
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Column Mapping</h4>
                    <p className="text-sm text-muted-foreground">Map your file columns to transaction fields</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Amount Column</Label>
                      <Select onValueChange={(value) => setColumnMapping({...columnMapping, amount: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {uploadData.columns.map((col) => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Description Column</Label>
                      <Select onValueChange={(value) => setColumnMapping({...columnMapping, description: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {uploadData.columns.map((col) => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Date Column</Label>
                      <Select onValueChange={(value) => setColumnMapping({...columnMapping, date: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select column" />
                        </SelectTrigger>
                        <SelectContent>
                          {uploadData.columns.map((col) => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Preview ({uploadData.totalRows} rows)</h5>
                    <div className="border rounded-md p-4 max-h-48 overflow-auto">
                      <pre className="text-xs">
                        {JSON.stringify(uploadData.preview, null, 2)}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleImport}>Import Transactions</Button>
                    <Button variant="outline" onClick={() => setUploadData(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <Input
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
                </div>
                <Select onValueChange={(value) => setFilters({...filters, categoryId: value === 'all' ? '' : value})}>
                  <SelectTrigger>
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
                <Select onValueChange={(value) => setFilters({...filters, accountId: value === 'all' ? '' : value})}>
                  <SelectTrigger>
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
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  placeholder="Start date"
                />
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  placeholder="End date"
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
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
                    <div className="space-y-2">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
                          <div className="flex items-center space-x-4 min-w-0 flex-1">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              transaction.category.type === 'INCOME' ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                <span className="block sm:inline">{transaction.account.name}</span>
                                <span className="hidden sm:inline"> • </span>
                                <span className="block sm:inline">{transaction.category.name}</span>
                                {transaction.subcategory && (
                                  <>
                                    <span className="hidden sm:inline"> • </span>
                                    <span className="block sm:inline">{transaction.subcategory.name}</span>
                                  </>
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="text-right flex-shrink-0">
                              <p className={`font-semibold text-lg ${
                                transaction.category.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {transaction.category.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(transaction.date).toLocaleDateString()}
                              </p>
                            </div>
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
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>
                        <span className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Next
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input
                  placeholder="Account name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                />
                <Select onValueChange={(value) => setNewAccount({...newAccount, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank Account</SelectItem>
                    <SelectItem value="WALLET">Wallet</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Initial balance"
                  value={newAccount.balance}
                  onChange={(e) => setNewAccount({...newAccount, balance: e.target.value})}
                />
                <Button onClick={handleCreateAccount} className="w-full">Add Account</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {accounts.map((account) => (
                  <div key={account.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium truncate">{account.name}</h4>
                      <p className="text-sm text-muted-foreground">{account.type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className="font-semibold text-lg">{formatCurrency(account.balance)}</p>
                        <p className="text-sm text-muted-foreground">
                          {account._count.transactions} transactions
                        </p>
                      </div>
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
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  placeholder="Category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
                <Select onValueChange={(value) => setNewCategory({...newCategory, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Income</SelectItem>
                    <SelectItem value="EXPENSE">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleCreateCategory} className="w-full">Add Category</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Add New Subcategory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select onValueChange={(value) => setNewSubcategory({...newSubcategory, categoryId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({category.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Subcategory name"
                  value={newSubcategory.name}
                  onChange={(e) => setNewSubcategory({...newSubcategory, name: e.target.value})}
                />
                <Button onClick={handleCreateSubcategory} className="w-full">Add Subcategory</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Your Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{category.name}</h4>
                        <Badge variant={category.type === 'INCOME' ? 'default' : 'secondary'}>
                          {category.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {category._count.transactions} transactions
                      </p>
                    </div>
                    
                    {category.subcategories.length > 0 && (
                      <div>
                        <Separator className="my-2" />
                        <div className="flex flex-wrap gap-1">
                          {category.subcategories.map((sub) => (
                            <Badge key={sub.id} variant="outline" className="text-xs">
                              {sub.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
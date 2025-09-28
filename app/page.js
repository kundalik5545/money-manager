"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ArrowRight, Shield, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

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
  
  // View toggle states
  const [transactionView, setTransactionView] = useState('card') // 'card' or 'table'
  const [accountView, setAccountView] = useState('card') // 'card' or 'table'  
  const [categoryView, setCategoryView] = useState('card') // 'card' or 'table'
  
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Upload className="w-4 h-4 mr-2 rotate-180" />
                Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={async () => {
                try {
                  const response = await fetch('/api/export?format=csv')
                  if (response.ok) {
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    toast.success('CSV file downloaded successfully')
                  } else {
                    toast.error('Failed to export CSV')
                  }
                } catch (error) {
                  toast.error('Failed to export CSV')
                  console.error('Export error:', error)
                }
              }}>
                📄 Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={async () => {
                try {
                  const response = await fetch('/api/export?format=xlsx')
                  if (response.ok) {
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `transactions_${new Date().toISOString().split('T')[0]}.xlsx`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                    toast.success('Excel file downloaded successfully')
                  } else {
                    toast.error('Failed to export Excel')
                  }
                } catch (error) {
                  toast.error('Failed to export Excel')
                  console.error('Export error:', error)
                }
              }}>
                📊 Export as Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
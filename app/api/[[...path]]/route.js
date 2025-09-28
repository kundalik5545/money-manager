import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const { userId } = auth()
  if (!userId) {
    return null
  }
  
  // Find or create user in our database
  let user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user) {
    // Create user if doesn't exist
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: '', // Will be updated when user provides it
      }
    })
  }
  
  return user
}

// GET /api/accounts
async function getAccounts() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      include: {
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, data: accounts })
  } catch (error) {
    console.error('Error fetching accounts:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/accounts
async function createAccount(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, balance = 0 } = body
    
    const account = await prisma.account.create({
      data: { 
        name, 
        type, 
        balance: parseFloat(balance),
        userId: user.id
      }
    })
    
    return NextResponse.json({ success: true, data: account })
  } catch (error) {
    console.error('Error creating account:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// GET /api/categories
async function getCategories() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      include: {
        subcategories: true,
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/categories
async function createCategory(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type } = body
    
    const category = await prisma.category.create({
      data: { 
        name, 
        type,
        userId: user.id
      }
    })
    
    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/categories/{id}/subcategories
async function createSubcategory(request, categoryId) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: user.id }
    })
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name } = body
    
    const subcategory = await prisma.subcategory.create({
      data: { name, categoryId }
    })
    
    return NextResponse.json({ success: true, data: subcategory })
  } catch (error) {
    console.error('Error creating subcategory:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// GET /api/transactions
async function getTransactions(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const categoryId = url.searchParams.get('categoryId')
    const subcategoryId = url.searchParams.get('subcategoryId')
    const accountId = url.searchParams.get('accountId')
    const startDate = url.searchParams.get('startDate')
    const endDate = url.searchParams.get('endDate')
    
    const whereClause = { userId: user.id }
    
    if (search) {
      whereClause.description = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    if (categoryId) {
      whereClause.categoryId = categoryId
    }
    
    if (subcategoryId) {
      whereClause.subcategoryId = subcategoryId
    }
    
    if (accountId) {
      whereClause.accountId = accountId
    }
    
    if (startDate && endDate) {
      whereClause.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }
    
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        account: true,
        category: true,
        subcategory: true
      },
      orderBy: { date: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/transactions
async function createTransaction(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, description, date, accountId, categoryId, subcategoryId } = body
    
    // Verify account and category belong to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id }
    })
    
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId: user.id }
    })
    
    if (!account || !category) {
      return NextResponse.json({ success: false, error: 'Invalid account or category' }, { status: 400 })
    }
    
    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        accountId,
        categoryId,
        subcategoryId: subcategoryId || null,
        userId: user.id
      },
      include: {
        account: true,
        category: true,
        subcategory: true
      }
    })
    
    // Update account balance
    const balanceChange = category.type === 'INCOME' ? parseFloat(amount) : -parseFloat(amount)
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: balanceChange } }
    })
    
    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// GET /api/analytics
async function getAnalytics(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'all'
    
    let dateFilter = {}
    const now = new Date()
    
    switch (period) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        dateFilter = { gte: weekAgo }
        break
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFilter = { gte: monthAgo }
        break
      case 'year':
        const yearAgo = new Date(now.getFullYear(), 0, 1)
        dateFilter = { gte: yearAgo }
        break
    }
    
    const whereClause = { userId: user.id }
    if (Object.keys(dateFilter).length > 0) {
      whereClause.date = dateFilter
    }
    
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: true,
        account: true
      }
    })
    
    const totalIncome = transactions
      .filter(t => t.category.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpense = transactions
      .filter(t => t.category.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const netSavings = totalIncome - totalExpense
    
    // Category breakdown
    const categoryBreakdown = transactions.reduce((acc, t) => {
      const key = t.category.name
      if (!acc[key]) {
        acc[key] = { name: key, value: 0, type: t.category.type }
      }
      acc[key].value += t.amount
      return acc
    }, {})
    
    // Monthly breakdown
    const monthlyData = transactions.reduce((acc, t) => {
      const month = t.date.toISOString().slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { month, income: 0, expense: 0 }
      }
      if (t.category.type === 'INCOME') {
        acc[month].income += t.amount
      } else {
        acc[month].expense += t.amount
      }
      return acc
    }, {})
    
    return NextResponse.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netSavings,
        transactionCount: transactions.length,
        categoryBreakdown: Object.values(categoryBreakdown),
        monthlyData: Object.values(monthlyData)
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// GET /api/export?format=csv|xlsx
async function exportTransactions(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const format = url.searchParams.get('format') || 'csv'
    
    // Fetch user's transactions with related data
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        account: true,
        category: true,
        subcategory: true
      },
      orderBy: { date: 'desc' }
    })
    
    // Prepare data for export
    const exportData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description,
      Amount: t.amount,
      Category: t.category.name,
      Subcategory: t.subcategory?.name || '',
      Account: t.account.name,
      Type: t.category.type
    }))
    
    if (format === 'xlsx') {
      // Create Excel file
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(exportData)
      
      // Auto-size columns
      const colWidths = []
      const headers = Object.keys(exportData[0] || {})
      headers.forEach((header, i) => {
        const maxLength = Math.max(
          header.length,
          ...exportData.map(row => String(row[header]).length)
        )
        colWidths[i] = { wch: Math.min(maxLength + 2, 50) }
      })
      ws['!cols'] = colWidths
      
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions')
      
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.xlsx"`
        }
      })
    } else {
      // Create CSV
      const headers = ['Date', 'Description', 'Amount', 'Category', 'Subcategory', 'Account', 'Type']
      const csvRows = [headers.join(',')]
      
      exportData.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || ''
          // Escape quotes and wrap in quotes if contains comma or quote
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        })
        csvRows.push(values.join(','))
      })
      
      const csvContent = csvRows.join('\n')
      
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
  } catch (error) {
    console.error('Error exporting transactions:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// File upload handler (placeholder - needs implementation)
async function uploadFile(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    // TODO: Implement file upload logic
    return NextResponse.json({ success: false, error: 'File upload not implemented' }, { status: 501 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// Import transactions handler (placeholder - needs implementation)
async function importTransactions(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    // TODO: Implement import logic
    return NextResponse.json({ success: false, error: 'Import not implemented' }, { status: 501 })
  } catch (error) {
    console.error('Error importing transactions:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function GET(request, { params }) {
  const path = params?.path?.join('/') || ''
  
  try {
    switch (path) {
      case 'accounts':
        return await getAccounts()
      case 'categories':
        return await getCategories()
      case 'transactions':
        return await getTransactions(request)
      case 'analytics':
        return await getAnalytics(request)
      case 'export':
        return await exportTransactions(request)
      default:
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request, { params }) {
  const path = params?.path?.join('/') || ''
  
  try {
    switch (path) {
      case 'accounts':
        return await createAccount(request)
      case 'categories':
        return await createCategory(request)
      case 'transactions':
        return await createTransaction(request)
      case 'upload':
        return await uploadFile(request)
      case 'import':
        return await importTransactions(request)
      default:
        // Handle subcategory creation
        if (path.includes('categories') && path.includes('subcategories')) {
          const categoryId = path.split('/')[1]
          return await createSubcategory(request, categoryId)
        }
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  const path = params?.path?.join('/') || ''
  const pathParts = path.split('/')
  
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Update transaction
    if (pathParts[0] === 'transactions' && pathParts[1]) {
      const transactionId = pathParts[1]
      const body = await request.json()
      const { amount, description, date, accountId, categoryId, subcategoryId } = body
      
      // Get the old transaction to calculate balance difference
      const oldTransaction = await prisma.transaction.findFirst({
        where: { id: transactionId, userId: user.id },
        include: { category: true }
      })
      
      if (!oldTransaction) {
        return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 })
      }
      
      // Verify new account and category belong to user
      const account = await prisma.account.findFirst({
        where: { id: accountId, userId: user.id }
      })
      
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId: user.id }
      })
      
      if (!account || !category) {
        return NextResponse.json({ success: false, error: 'Invalid account or category' }, { status: 400 })
      }
      
      // Update transaction
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          amount: parseFloat(amount),
          description,
          date: new Date(date),
          accountId,
          categoryId,
          subcategoryId: subcategoryId || null
        },
        include: {
          account: true,
          category: true,
          subcategory: true
        }
      })
      
      // Recalculate account balances if account or amount changed
      if (oldTransaction.accountId !== accountId || oldTransaction.amount !== parseFloat(amount) || oldTransaction.categoryId !== categoryId) {
        // Reverse old transaction effect
        const oldBalanceChange = oldTransaction.category.type === 'INCOME' ? -oldTransaction.amount : oldTransaction.amount
        await prisma.account.update({
          where: { id: oldTransaction.accountId },
          data: { balance: { increment: oldBalanceChange } }
        })
        
        // Apply new transaction effect
        const newBalanceChange = category.type === 'INCOME' ? parseFloat(amount) : -parseFloat(amount)
        await prisma.account.update({
          where: { id: accountId },
          data: { balance: { increment: newBalanceChange } }
        })
      }
      
      return NextResponse.json({ success: true, data: updatedTransaction })
    }
    
    // Update account
    if (pathParts[0] === 'accounts' && pathParts[1]) {
      const accountId = pathParts[1]
      const body = await request.json()
      const { name, type, balance } = body
      
      const updatedAccount = await prisma.account.update({
        where: { id: accountId, userId: user.id },
        data: { name, type, balance: parseFloat(balance) }
      })
      
      return NextResponse.json({ success: true, data: updatedAccount })
    }
    
    // Update category
    if (pathParts[0] === 'categories' && pathParts[1]) {
      const categoryId = pathParts[1]
      const body = await request.json()
      const { name, type } = body
      
      const updatedCategory = await prisma.category.update({
        where: { id: categoryId, userId: user.id },
        data: { name, type }
      })
      
      return NextResponse.json({ success: true, data: updatedCategory })
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('Update Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const path = params?.path?.join('/') || ''
  const pathParts = path.split('/')
  
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Delete transaction
    if (pathParts[0] === 'transactions' && pathParts[1]) {
      const transactionId = pathParts[1]
      
      // Get transaction details before deleting to reverse account balance
      const transaction = await prisma.transaction.findFirst({
        where: { id: transactionId, userId: user.id },
        include: { category: true }
      })
      
      if (transaction) {
        // Reverse the transaction's effect on account balance
        const balanceChange = transaction.category.type === 'INCOME' ? -transaction.amount : transaction.amount
        await prisma.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } }
        })
        
        // Delete the transaction
        await prisma.transaction.delete({ where: { id: transactionId } })
      }
      
      return NextResponse.json({ success: true })
    }
    
    // Delete account
    if (pathParts[0] === 'accounts' && pathParts[1]) {
      const accountId = pathParts[1]
      
      // Check if account has transactions
      const transactionCount = await prisma.transaction.count({
        where: { accountId, userId: user.id }
      })
      
      if (transactionCount > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot delete account with existing transactions' 
        }, { status: 400 })
      }
      
      await prisma.account.delete({ 
        where: { id: accountId, userId: user.id } 
      })
      return NextResponse.json({ success: true })
    }
    
    // Delete category
    if (pathParts[0] === 'categories' && pathParts[1]) {
      const categoryId = pathParts[1]
      
      // Check if category has transactions
      const transactionCount = await prisma.transaction.count({
        where: { categoryId, userId: user.id }
      })
      
      if (transactionCount > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot delete category with existing transactions' 
        }, { status: 400 })
      }
      
      await prisma.category.delete({ 
        where: { id: categoryId, userId: user.id } 
      })
      return NextResponse.json({ success: true })
    }
    
    // Delete subcategory
    if (pathParts[0] === 'subcategories' && pathParts[1]) {
      const subcategoryId = pathParts[1]
      
      // Check if subcategory has transactions
      const transactionCount = await prisma.transaction.count({
        where: { subcategoryId }
      })
      
      if (transactionCount > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Cannot delete subcategory with existing transactions' 
        }, { status: 400 })
      }
      
      // Verify subcategory belongs to user's category
      const subcategory = await prisma.subcategory.findFirst({
        where: { id: subcategoryId },
        include: { category: true }
      })
      
      if (!subcategory || subcategory.category.userId !== user.id) {
        return NextResponse.json({ 
          success: false, 
          error: 'Subcategory not found' 
        }, { status: 404 })
      }
      
      await prisma.subcategory.delete({ where: { id: subcategoryId } })
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('Delete Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
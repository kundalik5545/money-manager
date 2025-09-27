import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

// GET /api/accounts
async function getAccounts() {
  try {
    const accounts = await prisma.account.findMany({
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
    const body = await request.json()
    const { name, type, balance = 0 } = body
    
    const account = await prisma.account.create({
      data: { name, type, balance: parseFloat(balance) }
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
    const categories = await prisma.category.findMany({
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
    const body = await request.json()
    const { name, type, color = '#3b82f6' } = body
    
    const category = await prisma.category.create({
      data: { name, type, color }
    })
    
    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/categories/:id/subcategories
async function createSubcategory(request, categoryId) {
  try {
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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search')
    const categoryId = searchParams.get('categoryId')
    const accountId = searchParams.get('accountId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const skip = (page - 1) * limit
    
    const where = {}
    
    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive'
      }
    }
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (accountId) {
      where.accountId = accountId
    }
    
    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }
    
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          account: true,
          category: true,
          subcategory: true
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit
      }),
      prisma.transaction.count({ where })
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        transactions,
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/transactions
async function createTransaction(request) {
  try {
    const body = await request.json()
    const { amount, description, date, accountId, categoryId, subcategoryId } = body
    
    // Create transaction
    const transaction = await prisma.transaction.create({
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
    
    // Update account balance
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    const balanceChange = category.type === 'INCOME' ? parseFloat(amount) : -parseFloat(amount)
    
    await prisma.account.update({
      where: { id: accountId },
      data: {
        balance: {
          increment: balanceChange
        }
      }
    })
    
    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/upload
async function uploadFile(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }
    
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)
    
    // Return parsed data for column mapping
    const preview = data.slice(0, 5) // First 5 rows for preview
    const columns = data.length > 0 ? Object.keys(data[0]) : []
    
    return NextResponse.json({
      success: true,
      data: {
        preview,
        columns,
        totalRows: data.length,
        rawData: data
      }
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/import
async function importTransactions(request) {
  try {
    const body = await request.json()
    const { data, mapping, defaultAccountId, defaultCategoryId } = body
    
    const transactions = []
    
    for (const row of data) {
      const amount = parseFloat(row[mapping.amount] || 0)
      const description = row[mapping.description] || 'Imported transaction'
      const date = new Date(row[mapping.date] || new Date())
      
      if (amount !== 0) {
        transactions.push({
          amount: Math.abs(amount),
          description,
          date,
          accountId: defaultAccountId,
          categoryId: defaultCategoryId
        })
      }
    }
    
    // Bulk create transactions
    const created = await prisma.transaction.createMany({
      data: transactions
    })
    
    return NextResponse.json({
      success: true,
      data: { imported: created.count }
    })
  } catch (error) {
    console.error('Error importing transactions:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// GET /api/analytics
async function getAnalytics(request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const dateFilter = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)
    
    const whereClause = startDate || endDate ? { date: dateFilter } : {}
    
    // Get transactions with categories
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

// Main handler
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

export async function DELETE(request, { params }) {
  const path = params?.path?.join('/') || ''
  const pathParts = path.split('/')
  
  try {
    if (pathParts[0] === 'transactions' && pathParts[1]) {
      const transactionId = pathParts[1]
      await prisma.transaction.delete({ where: { id: transactionId } })
      return NextResponse.json({ success: true })
    }
    
    if (pathParts[0] === 'categories' && pathParts[1]) {
      const categoryId = pathParts[1]
      await prisma.category.delete({ where: { id: categoryId } })
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  } catch (error) {
    console.error('Delete Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
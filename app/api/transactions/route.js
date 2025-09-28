import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const { userId } = auth()
  if (!userId) {
    return null
  }
  
  let user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: '',
      }
    })
  }
  
  return user
}

// GET /api/transactions
export async function GET(request) {
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
export async function POST(request) {
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
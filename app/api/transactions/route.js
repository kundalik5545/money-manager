import { NextResponse } from 'next/server'
// import { auth } from '@clerk/nextjs/server' // Temporarily disabled
import { prisma } from '@/lib/prisma'

// Temporary helper function without authentication
async function getAuthenticatedUser() {
  // For development, return the first user or create a demo user
  let user = await prisma.user.findFirst()
  
  if (!user) {
    // Create a demo user if none exists
    user = await prisma.user.create({
      data: {
        clerkId: 'demo-user-001',
        email: 'demo@example.com',
      }
    })
  }
  
  return user
}

// Original Clerk helper function (commented out)
// async function getAuthenticatedUser() {
//   const { userId } = auth()
//   if (!userId) {
//     return null
//   }
//   
//   let user = await prisma.user.findUnique({
//     where: { clerkId: userId }
//   })
//   
//   if (!user) {
//     user = await prisma.user.create({
//       data: {
//         clerkId: userId,
//         email: '',
//       }
//     })
//   }
//   
//   return user
// }

// GET /api/transactions
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
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
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
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

// PUT /api/transactions
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const body = await request.json()
    const { id, amount, description, date, accountId, categoryId, subcategoryId } = body
    
    // Get the existing transaction
    const existingTransaction = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
      include: { category: true }
    })
    
    if (!existingTransaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 })
    }
    
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
    
    // Reverse the old transaction's balance change
    const oldBalanceChange = existingTransaction.category.type === 'INCOME' ? -existingTransaction.amount : existingTransaction.amount
    await prisma.account.update({
      where: { id: existingTransaction.accountId },
      data: { balance: { increment: oldBalanceChange } }
    })
    
    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id },
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
    
    // Apply the new transaction's balance change
    const newBalanceChange = category.type === 'INCOME' ? parseFloat(amount) : -parseFloat(amount)
    await prisma.account.update({
      where: { id: accountId },
      data: { balance: { increment: newBalanceChange } }
    })
    
    return NextResponse.json({ success: true, data: transaction })
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/transactions
export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Transaction ID required' }, { status: 400 })
    }
    
    // Get the transaction to reverse its balance change
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: user.id },
      include: { category: true }
    })
    
    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 })
    }
    
    // Reverse the balance change
    const balanceChange = transaction.category.type === 'INCOME' ? -transaction.amount : transaction.amount
    await prisma.account.update({
      where: { id: transaction.accountId },
      data: { balance: { increment: balanceChange } }
    })
    
    // Delete the transaction
    await prisma.transaction.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true, message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
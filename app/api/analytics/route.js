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

// GET /api/analytics
export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    // Get current month dates
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get all transactions for current month
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        category: true,
        account: true
      }
    })

    // Calculate analytics
    let totalIncome = 0
    let totalExpense = 0
    
    transactions.forEach(transaction => {
      if (transaction.category.type === 'INCOME') {
        totalIncome += transaction.amount
      } else {
        totalExpense += transaction.amount
      }
    })

    const netSavings = totalIncome - totalExpense
    const transactionCount = transactions.length

    // Get total account balances
    const accounts = await prisma.account.findMany({
      where: { userId: user.id }
    })
    
    const accountsTotal = accounts.reduce((sum, account) => sum + account.balance, 0)

    return NextResponse.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        netSavings,
        transactionCount,
        accountsTotal,
        monthlyTransactions: transactions
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
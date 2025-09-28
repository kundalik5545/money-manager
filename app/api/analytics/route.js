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

// GET /api/analytics
export async function GET(request) {
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
    
    // Get transactions and accounts
    const [transactions, accounts] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
          account: true
        }
      }),
      prisma.account.findMany({
        where: { userId: user.id }
      })
    ])
    
    const totalIncome = transactions
      .filter(t => t.category.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpense = transactions
      .filter(t => t.category.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const netSavings = totalIncome - totalExpense
    
    const accountsTotal = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    
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
        accountsTotal,
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
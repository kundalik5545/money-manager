import { NextResponse } from 'next/server'
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

// GET /api/budgets - Fetch all budgets for user
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const categoryId = searchParams.get('categoryId')

    const where = { userId: user.id }
    if (active === 'true') {
      where.isActive = true
    }
    if (categoryId) {
      where.categoryId = categoryId
    }

    const budgets = await prisma.budget.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate spent amounts and progress for each budget
    const budgetsWithProgress = await Promise.all(
      budgets.map(async (budget) => {
        // Calculate spent amount in the current period
        const now = new Date()
        let periodStart = budget.startDate
        let periodEnd = budget.endDate

        // If the budget period has ended, calculate for the last complete period
        if (periodEnd < now) {
          // For ongoing tracking, you might want to calculate the next period
          // For now, we'll use the original period
        }

        // Get transactions in this period for this category (if specified)
        const transactionWhere = {
          userId: user.id,
          date: {
            gte: periodStart,
            lte: periodEnd
          }
        }

        if (budget.categoryId) {
          transactionWhere.categoryId = budget.categoryId
        }

        const transactions = await prisma.transaction.findMany({
          where: transactionWhere,
          select: { amount: true }
        })

        // Calculate spent amount (sum of expense transactions)
        const spent = transactions
          .filter(t => t.amount < 0) // Only expenses (negative amounts)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0)

        const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
        const remaining = Math.max(0, budget.amount - spent)

        return {
          ...budget,
          spent,
          progress: Math.min(100, progress),
          remaining,
          status: progress >= 100 ? 'exceeded' : progress >= budget.warningThreshold * 100 ? 'warning' : 'on-track'
        }
      })
    )

    return NextResponse.json({ success: true, data: budgetsWithProgress })
  } catch (error) {
    console.error('Error fetching budgets:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/budgets - Create new budget
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      name, 
      amount, 
      period = 'MONTHLY', 
      categoryId, 
      startDate, 
      endDate,
      emailNotifications = true,
      warningThreshold = 0.8
    } = body

    if (!name || !amount) {
      return NextResponse.json({ success: false, error: 'Name and amount are required' }, { status: 400 })
    }

    // Calculate period dates if not provided
    let calculatedStartDate = startDate ? new Date(startDate) : new Date()
    let calculatedEndDate = endDate ? new Date(endDate) : new Date()

    if (!endDate) {
      switch (period) {
        case 'WEEKLY':
          calculatedEndDate = new Date(calculatedStartDate)
          calculatedEndDate.setDate(calculatedStartDate.getDate() + 7)
          break
        case 'MONTHLY':
          calculatedEndDate = new Date(calculatedStartDate)
          calculatedEndDate.setMonth(calculatedStartDate.getMonth() + 1)
          break
        case 'YEARLY':
          calculatedEndDate = new Date(calculatedStartDate)
          calculatedEndDate.setFullYear(calculatedStartDate.getFullYear() + 1)
          break
      }
    }

    const budget = await prisma.budget.create({
      data: {
        name,
        amount: parseFloat(amount),
        period,
        categoryId: categoryId || null,
        startDate: calculatedStartDate,
        endDate: calculatedEndDate,
        emailNotifications,
        warningThreshold: parseFloat(warningThreshold),
        userId: user.id
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: budget })
  } catch (error) {
    console.error('Error creating budget:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/budgets - Update budget
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      id, 
      name, 
      amount, 
      period, 
      categoryId, 
      startDate, 
      endDate,
      emailNotifications,
      warningThreshold,
      isActive
    } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Budget ID is required' }, { status: 400 })
    }

    // Verify budget belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingBudget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
    }

    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (amount !== undefined) updateData.amount = parseFloat(amount)
    if (period !== undefined) updateData.period = period
    if (categoryId !== undefined) updateData.categoryId = categoryId || null
    if (startDate !== undefined) updateData.startDate = new Date(startDate)
    if (endDate !== undefined) updateData.endDate = new Date(endDate)
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications
    if (warningThreshold !== undefined) updateData.warningThreshold = parseFloat(warningThreshold)
    if (isActive !== undefined) updateData.isActive = isActive

    const budget = await prisma.budget.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: budget })
  } catch (error) {
    console.error('Error updating budget:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/budgets - Delete budget
export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Budget ID required' }, { status: 400 })
    }

    // Verify budget belongs to user
    const budget = await prisma.budget.findFirst({
      where: { id, userId: user.id }
    })

    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 })
    }

    await prisma.budget.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Budget deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting budget:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
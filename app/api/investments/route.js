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

// GET /api/investments - Fetch all investments for user
export async function GET(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const where = { userId: user.id }
    if (type) {
      where.type = type
    }

    const investments = await prisma.investment.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    // Calculate profit/loss and percentage change for each investment
    const investmentsWithMetrics = investments.map(investment => {
      const totalValue = investment.currentValue
      const totalInvested = investment.investedAmount
      const profitLoss = totalValue - totalInvested
      const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0
      const dayChange = investment.currentPrice - investment.purchasePrice
      const dayChangePercent = investment.purchasePrice > 0 ? (dayChange / investment.purchasePrice) * 100 : 0

      return {
        ...investment,
        profitLoss,
        profitLossPercent,
        dayChange,
        dayChangePercent,
        status: profitLoss >= 0 ? 'profit' : 'loss'
      }
    })

    return NextResponse.json({ success: true, data: investmentsWithMetrics })
  } catch (error) {
    console.error('Error fetching investments:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/investments - Create new investment
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      symbol, 
      name, 
      type, 
      quantity, 
      purchasePrice, 
      currentPrice 
    } = body

    if (!symbol || !name || !type || !quantity || !purchasePrice) {
      return NextResponse.json({ 
        success: false, 
        error: 'Symbol, name, type, quantity, and purchase price are required' 
      }, { status: 400 })
    }

    const investedAmount = parseFloat(quantity) * parseFloat(purchasePrice)
    const currentValue = parseFloat(quantity) * (parseFloat(currentPrice) || parseFloat(purchasePrice))

    const investment = await prisma.investment.create({
      data: {
        symbol: symbol.toUpperCase(),
        name,
        type,
        quantity: parseFloat(quantity),
        purchasePrice: parseFloat(purchasePrice),
        currentPrice: parseFloat(currentPrice) || parseFloat(purchasePrice),
        investedAmount,
        currentValue,
        userId: user.id
      }
    })

    return NextResponse.json({ success: true, data: investment })
  } catch (error) {
    console.error('Error creating investment:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/investments - Update investment
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      id, 
      symbol, 
      name, 
      type, 
      quantity, 
      purchasePrice, 
      currentPrice 
    } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'Investment ID is required' }, { status: 400 })
    }

    // Verify investment belongs to user
    const existingInvestment = await prisma.investment.findFirst({
      where: { id, userId: user.id }
    })

    if (!existingInvestment) {
      return NextResponse.json({ success: false, error: 'Investment not found' }, { status: 404 })
    }

    const updateData = {}
    if (symbol !== undefined) updateData.symbol = symbol.toUpperCase()
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (quantity !== undefined) updateData.quantity = parseFloat(quantity)
    if (purchasePrice !== undefined) updateData.purchasePrice = parseFloat(purchasePrice)
    if (currentPrice !== undefined) updateData.currentPrice = parseFloat(currentPrice)

    // Recalculate amounts if quantity or prices changed
    const finalQuantity = updateData.quantity !== undefined ? updateData.quantity : existingInvestment.quantity
    const finalPurchasePrice = updateData.purchasePrice !== undefined ? updateData.purchasePrice : existingInvestment.purchasePrice
    const finalCurrentPrice = updateData.currentPrice !== undefined ? updateData.currentPrice : existingInvestment.currentPrice

    updateData.investedAmount = finalQuantity * finalPurchasePrice
    updateData.currentValue = finalQuantity * finalCurrentPrice

    const investment = await prisma.investment.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json({ success: true, data: investment })
  } catch (error) {
    console.error('Error updating investment:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/investments - Delete investment
export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Investment ID required' }, { status: 400 })
    }

    // Verify investment belongs to user
    const investment = await prisma.investment.findFirst({
      where: { id, userId: user.id }
    })

    if (!investment) {
      return NextResponse.json({ success: false, error: 'Investment not found' }, { status: 404 })
    }

    await prisma.investment.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Investment deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting investment:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
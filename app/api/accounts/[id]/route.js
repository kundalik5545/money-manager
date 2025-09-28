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

// PUT /api/accounts/[id]
export async function PUT(request, { params }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const accountId = params.id
    const body = await request.json()
    const { name, type, balance } = body
    
    const updatedAccount = await prisma.account.update({
      where: { id: accountId, userId: user.id },
      data: { name, type, balance: parseFloat(balance) }
    })
    
    return NextResponse.json({ success: true, data: updatedAccount })
  } catch (error) {
    console.error('Update Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/accounts/[id]
export async function DELETE(request, { params }) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const accountId = params.id
    
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
  } catch (error) {
    console.error('Delete Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
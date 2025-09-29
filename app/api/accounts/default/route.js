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

// PUT /api/accounts/default - Set default account
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const body = await request.json()
    const { accountId } = body
    
    if (!accountId) {
      return NextResponse.json({ success: false, error: 'Account ID required' }, { status: 400 })
    }
    
    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id: accountId, userId: user.id }
    })
    
    if (!account) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 })
    }
    
    // Update all user's accounts to not be default
    await prisma.account.updateMany({
      where: { userId: user.id },
      data: { isDefault: false }
    })
    
    // Set the selected account as default
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { isDefault: true }
    })
    
    // Also update the user's defaultAccountId
    await prisma.user.update({
      where: { id: user.id },
      data: { defaultAccountId: accountId }
    })
    
    return NextResponse.json({ 
      success: true, 
      data: updatedAccount,
      message: 'Default account updated successfully'
    })
  } catch (error) {
    console.error('Error setting default account:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
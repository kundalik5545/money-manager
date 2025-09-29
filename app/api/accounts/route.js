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
//   // Find or create user in our database
//   let user = await prisma.user.findUnique({
//     where: { clerkId: userId }
//   })
//   
//   if (!user) {
//     // Create user if doesn't exist
//     user = await prisma.user.create({
//       data: {
//         clerkId: userId,
//         email: '', // Will be updated when user provides it
//       }
//     })
//   }
//   
//   return user
// }

// GET /api/accounts
export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
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
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
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

// PUT /api/accounts
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const body = await request.json()
    const { id, name, type, balance } = body
    
    // Verify account belongs to user
    const existingAccount = await prisma.account.findFirst({
      where: { id, userId: user.id }
    })
    
    if (!existingAccount) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 })
    }
    
    const account = await prisma.account.update({
      where: { id },
      data: { 
        name, 
        type, 
        balance: parseFloat(balance)
      }
    })
    
    return NextResponse.json({ success: true, data: account })
  } catch (error) {
    console.error('Error updating account:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/accounts
export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Account ID required' }, { status: 400 })
    }
    
    // Verify account belongs to user
    const account = await prisma.account.findFirst({
      where: { id, userId: user.id }
    })
    
    if (!account) {
      return NextResponse.json({ success: false, error: 'Account not found' }, { status: 404 })
    }
    
    await prisma.account.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true, message: 'Account deleted successfully' })
  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
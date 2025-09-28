import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// Helper function to get authenticated user
async function getAuthenticatedUser() {
  const { userId } = auth()
  if (!userId) {
    return null
  }
  
  // Find or create user in our database
  let user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })
  
  if (!user) {
    // Create user if doesn't exist
    user = await prisma.user.create({
      data: {
        clerkId: userId,
        email: '', // Will be updated when user provides it
      }
    })
  }
  
  return user
}

// GET /api/accounts
export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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
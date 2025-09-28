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

// GET /api/categories
export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      include: {
        subcategories: true,
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// POST /api/categories
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type } = body
    
    const category = await prisma.category.create({
      data: { 
        name, 
        type,
        userId: user.id
      }
    })
    
    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
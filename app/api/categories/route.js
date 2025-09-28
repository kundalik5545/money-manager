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

// GET /api/categories
export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const categories = await prisma.category.findMany({
      where: { userId: user.id },
      include: {
        subcategories: true,
        _count: {
          select: { transactions: true }
        }
      },
      orderBy: { name: 'asc' }
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
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
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

// PUT /api/categories
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const body = await request.json()
    const { id, name, type, color } = body
    
    // Verify category belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: { id, userId: user.id }
    })
    
    if (!existingCategory) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }
    
    const category = await prisma.category.update({
      where: { id },
      data: { 
        name, 
        type,
        color: color || '#3B82F6'
      }
    })
    
    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// DELETE /api/categories
export async function DELETE(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID required' }, { status: 400 })
    }
    
    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id, userId: user.id }
    })
    
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 })
    }
    
    // Check if category has transactions
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id }
    })
    
    if (transactionCount > 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete category with existing transactions' 
      }, { status: 400 })
    }
    
    await prisma.category.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
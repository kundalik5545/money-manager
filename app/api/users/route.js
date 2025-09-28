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

// GET /api/users
export async function GET() {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

// PUT /api/users
export async function PUT(request) {
  try {
    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 400 })
    }

    const body = await request.json()
    const { email, firstName, lastName } = body
    
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: email || user.email,
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName
      }
    })
    
    return NextResponse.json({ success: true, data: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
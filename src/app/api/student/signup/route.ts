import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, seatNumber, password } = await request.json()

    // Check if email exists
    const existingEmail = await prisma.student.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { message: 'Email already exists', code: 'EMAIL_EXISTS' },
        { status: 400 }
      )
    }

    // Check if seat number is taken
    const existingSeat = await prisma.student.findUnique({
      where: { seatNumber },
    })

    if (existingSeat) {
      return NextResponse.json(
        { message: 'Seat number already taken', code: 'SEAT_TAKEN' },
        { status: 400 }
      )
    }

    // Hash password and create student
    const passwordHash = await bcrypt.hash(password, 10)

    const student = await prisma.student.create({
      data: {
        email,
        seatNumber,
        passwordHash,
        isLocked: true,
      },
    })

    return NextResponse.json({
      message: 'Student registered successfully',
      student: {
        id: student.id,
        email: student.email,
        seatNumber: student.seatNumber,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

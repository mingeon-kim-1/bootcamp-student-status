import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const seats = await prisma.seatPosition.findMany({
      orderBy: { seatNumber: 'asc' },
    })

    return NextResponse.json(seats)
  } catch (error) {
    console.error('Get seats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { seats } = await request.json()

    // Delete all existing seat positions
    await prisma.seatPosition.deleteMany()

    // Create new seat positions
    if (seats && seats.length > 0) {
      await prisma.seatPosition.createMany({
        data: seats.map((seat: { seatNumber: number; gridRow: number; gridCol: number; label?: string }) => ({
          seatNumber: seat.seatNumber,
          gridRow: seat.gridRow,
          gridCol: seat.gridCol,
          label: seat.label || null,
        })),
      })
    }

    const newSeats = await prisma.seatPosition.findMany({
      orderBy: { seatNumber: 'asc' },
    })

    return NextResponse.json(newSeats)
  } catch (error) {
    console.error('Update seats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await prisma.seatPosition.deleteMany()

    return NextResponse.json({ message: 'All seat positions cleared' })
  } catch (error) {
    console.error('Delete seats error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

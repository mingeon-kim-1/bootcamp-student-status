import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const branding = await prisma.branding.findUnique({
      where: { id: 'default' },
    })

    if (!branding) {
      const newBranding = await prisma.branding.create({
        data: { id: 'default' },
      })
      return NextResponse.json(newBranding)
    }

    return NextResponse.json(branding)
  } catch (error) {
    console.error('Get branding error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    const branding = await prisma.branding.upsert({
      where: { id: 'default' },
      update: {
        loginImagePath: data.loginImagePath,
        loginText: data.loginText,
        displayImagePath: data.displayImagePath,
        displayText: data.displayText,
        organizationName: data.organizationName,
      },
      create: {
        id: 'default',
        loginImagePath: data.loginImagePath,
        loginText: data.loginText,
        displayImagePath: data.displayImagePath,
        displayText: data.displayText,
        organizationName: data.organizationName,
      },
    })

    return NextResponse.json(branding)
  } catch (error) {
    console.error('Update branding error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

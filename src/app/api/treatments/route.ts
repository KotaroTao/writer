import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const categories = await prisma.treatmentCategory.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error('Failed to fetch treatments:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch treatments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, defaultPriorities } = body

    const category = await prisma.treatmentCategory.create({
      data: {
        name,
        description: description || null,
        defaultPriorities: JSON.stringify(defaultPriorities || []),
      },
    })

    return NextResponse.json({ success: true, data: category })
  } catch (error) {
    console.error('Failed to create treatment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create treatment' },
      { status: 500 }
    )
  }
}

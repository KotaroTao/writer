import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const clinics = await prisma.clinic.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        treatments: {
          include: { category: true },
        },
      },
    })

    return NextResponse.json({ success: true, data: clinics })
  } catch (error) {
    console.error('Failed to fetch clinics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clinics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, url, address, phone, targetArea, description } = body

    const clinic = await prisma.clinic.create({
      data: {
        name,
        url,
        address,
        phone,
        targetArea: targetArea || null,
        description: description || null,
      },
    })

    return NextResponse.json({ success: true, data: clinic })
  } catch (error) {
    console.error('Failed to create clinic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create clinic' },
      { status: 500 }
    )
  }
}

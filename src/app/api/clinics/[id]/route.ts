import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: params.id },
      include: {
        treatments: {
          include: { category: true },
        },
      },
    })

    if (!clinic) {
      return NextResponse.json(
        { success: false, error: 'Clinic not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: clinic })
  } catch (error) {
    console.error('Failed to fetch clinic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clinic' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, url, address, phone, targetArea, description } = body

    const clinic = await prisma.clinic.update({
      where: { id: params.id },
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
    console.error('Failed to update clinic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update clinic' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.clinic.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete clinic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete clinic' },
      { status: 500 }
    )
  }
}

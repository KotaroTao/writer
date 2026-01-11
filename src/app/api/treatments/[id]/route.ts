import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.treatmentCategory.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete treatment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete treatment' },
      { status: 500 }
    )
  }
}

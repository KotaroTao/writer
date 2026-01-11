import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { categoryId, enabled, priorities } = body

    const treatment = await prisma.clinicTreatment.upsert({
      where: {
        clinicId_categoryId: {
          clinicId: params.id,
          categoryId,
        },
      },
      update: {
        enabled,
        priorities: JSON.stringify(priorities || []),
      },
      create: {
        clinicId: params.id,
        categoryId,
        enabled,
        priorities: JSON.stringify(priorities || []),
      },
    })

    return NextResponse.json({ success: true, data: treatment })
  } catch (error) {
    console.error('Failed to update treatment:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update treatment' },
      { status: 500 }
    )
  }
}

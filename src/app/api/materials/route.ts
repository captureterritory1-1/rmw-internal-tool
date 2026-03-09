import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const materials = await prisma.material.findMany({
      select: {
        id: true,
        name: true,
        hsnCode: true,
        defaultRate: true,
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error('Failed to fetch materials:', error)
    return NextResponse.json(
      { error: 'Failed to fetch materials' },
      { status: 500 }
    )
  }
}

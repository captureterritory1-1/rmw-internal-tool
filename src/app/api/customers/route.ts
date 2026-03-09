import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')
    const q = searchParams.get('q')

    if (phone) {
      const customer = await prisma.customer.findUnique({
        where: { phone },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          gstin: true,
        },
      })

      if (!customer) {
        return NextResponse.json(null)
      }

      return NextResponse.json(customer)
    }

    if (q) {
      const customers = await prisma.customer.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
          ],
        },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          gstin: true,
        },
        orderBy: { name: 'asc' },
      })

      return NextResponse.json(customers)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Failed to fetch customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

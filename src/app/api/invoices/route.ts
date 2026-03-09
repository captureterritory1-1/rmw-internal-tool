import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateInvoiceNumber } from '@/lib/invoice-number'
import type { InvoiceFormData, LineItem } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const where: Record<string, unknown> = {}
    const AND: Record<string, unknown>[] = []

    if (search) {
      AND.push({
        OR: [
          { invoiceNumber: { contains: search } },
          { customerName: { contains: search } },
          { customerPhone: { contains: search } },
        ],
      })
    }

    if (from) {
      AND.push({ date: { gte: new Date(from) } })
    }

    if (to) {
      AND.push({ date: { lte: new Date(to + 'T23:59:59.999Z') } })
    }

    if (AND.length > 0) {
      where.AND = AND
    }

    const invoices = await prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    const parsed = invoices.map((inv) => ({
      ...inv,
      items: JSON.parse(inv.items) as LineItem[],
      date: inv.date.toISOString(),
      createdAt: inv.createdAt.toISOString(),
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Failed to fetch invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: InvoiceFormData = await request.json()

    const {
      customerName,
      customerPhone,
      customerAddress,
      customerGstin,
      items,
      gstEnabled,
      vehicleNumber,
      ewayBill,
      notes,
    } = body

    // Upsert customer by phone
    const customer = await prisma.customer.upsert({
      where: { phone: customerPhone },
      update: {
        name: customerName,
        address: customerAddress || null,
        gstin: customerGstin || null,
      },
      create: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress || null,
        gstin: customerGstin || null,
      },
    })

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const cgst = gstEnabled ? Math.round(subtotal * 0.09 * 100) / 100 : 0
    const sgst = gstEnabled ? Math.round(subtotal * 0.09 * 100) / 100 : 0
    const total = Math.round((subtotal + cgst + sgst) * 100) / 100

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber()

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        customerId: customer.id,
        customerName,
        customerPhone,
        customerAddress: customerAddress || null,
        customerGstin: customerGstin || null,
        items: JSON.stringify(items),
        subtotal,
        cgst,
        sgst,
        total,
        gstEnabled,
        vehicleNumber: vehicleNumber || null,
        ewayBill: ewayBill || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(
      {
        ...invoice,
        items: JSON.parse(invoice.items) as LineItem[],
        date: invoice.date.toISOString(),
        createdAt: invoice.createdAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create invoice:', error)
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateInvoicePdf } from '@/lib/pdf/generate'
import type { LineItem } from '@/types'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid invoice ID' },
        { status: 400 }
      )
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id },
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    const invoiceData = {
      ...invoice,
      items: JSON.parse(invoice.items) as LineItem[],
      date: invoice.date.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
    }

    const pdfBuffer = await generateInvoicePdf(invoiceData)

    const download = request.nextUrl.searchParams.get('download') === 'true'

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': download
          ? `attachment; filename="${invoice.invoiceNumber}.pdf"`
          : `inline; filename="${invoice.invoiceNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Failed to generate PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

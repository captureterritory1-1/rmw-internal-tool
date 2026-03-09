'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import type { InvoiceData } from '@/types'
import { formatCurrency, formatDate, numberToWords } from '@/lib/utils'

export default function InvoiceDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [generatingPdf, setGeneratingPdf] = useState(false)

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${id}`)
        if (!res.ok) throw new Error('Failed to fetch invoice')
        const data = await res.json()
        setInvoice(data)
      } catch {
        setError('Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }
    fetchInvoice()
  }, [id])

  const handleDownload = async () => {
    setGeneratingPdf(true)
    try {
      const res = await fetch(`/api/invoices/${id}/pdf?download=true`)
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${invoice?.invoiceNumber || 'invoice'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handlePrint = async () => {
    setGeneratingPdf(true)
    try {
      const res = await fetch(`/api/invoices/${id}/pdf`)
      if (!res.ok) throw new Error('Failed to generate PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      if (printWindow) {
        printWindow.addEventListener('load', () => {
          printWindow.print()
        })
      }
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleWhatsApp = () => {
    if (!invoice) return
    const message = encodeURIComponent(
      `Invoice ${invoice.invoiceNumber} from Rajasthan Marble World\n` +
      `Customer: ${invoice.customerName}\n` +
      `Total: ${formatCurrency(invoice.total)}\n` +
      `Date: ${formatDate(invoice.date)}`
    )
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-500">Loading invoice...</div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-lg text-red-500">{error || 'Invoice not found'}</div>
        <Link href="/invoices" className="text-brand-green underline">
          Back to invoices
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/invoices" className="text-brand-green hover:underline text-sm mb-2 inline-block">
            &larr; Back to Invoices
          </Link>
          <h1 className="text-2xl font-bold text-brand-green">
            {invoice.invoiceNumber}
          </h1>
          <p className="text-gray-500">{formatDate(invoice.date)}</p>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {generatingPdf ? 'Generating...' : 'Download PDF'}
          </button>

          <button
            onClick={handlePrint}
            disabled={generatingPdf}
            className="flex items-center gap-2 px-4 py-2 border-2 border-brand-green text-brand-green rounded-lg hover:bg-brand-green-light transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>

          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp
          </button>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="bg-white rounded-xl shadow-lg border border-marble-border p-8">
        {/* Company Header */}
        <div className="flex justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="RMW Logo" className="h-10 w-auto" />
              <h2 className="text-xl font-bold text-brand-green">RAJASTHAN MARBLE WORLD</h2>
            </div>
            <p className="text-sm text-gray-500">Dealers of Exclusive Marbles &amp; Granites</p>
            <p className="text-sm text-gray-600 mt-1">Plot No. 40 &amp; 41, Adarsha Nagar</p>
            <p className="text-sm text-gray-600">Chengicherla (V) R.R. Dist, Hyderabad</p>
            <p className="text-sm text-gray-600">Phone: 98666 35165</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-brand-green">QUOTATION</h2>
            <p className="text-sm mt-2"><span className="text-gray-500">Date:</span> {formatDate(invoice.date)}</p>
            <p className="text-sm"><span className="text-gray-500">Invoice #:</span> {invoice.invoiceNumber}</p>
            {invoice.vehicleNumber && (
              <p className="text-sm"><span className="text-gray-500">Vehicle:</span> {invoice.vehicleNumber}</p>
            )}
            {invoice.ewayBill && (
              <p className="text-sm"><span className="text-gray-500">E-Way Bill:</span> {invoice.ewayBill}</p>
            )}
          </div>
        </div>

        <div className="h-0.5 bg-brand-green mb-6" />

        {/* Customer */}
        <div className="mb-6">
          <div className="bg-brand-green text-white px-4 py-2 rounded-t font-semibold text-sm">
            BILL TO
          </div>
          <div className="border border-t-0 border-marble-border px-4 py-3 rounded-b">
            <p className="font-semibold">{invoice.customerName}</p>
            {invoice.customerAddress && <p className="text-sm text-gray-600">{invoice.customerAddress}</p>}
            <p className="text-sm text-gray-600">Phone: {invoice.customerPhone}</p>
            {invoice.customerGstin && <p className="text-sm text-gray-600">GSTIN: {invoice.customerGstin}</p>}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-brand-green text-white text-sm">
              <th className="py-2 px-3 text-left rounded-tl">#</th>
              <th className="py-2 px-3 text-left">Material Description</th>
              <th className="py-2 px-3 text-left">HSN</th>
              <th className="py-2 px-3 text-right">Qty (Sqft)</th>
              <th className="py-2 px-3 text-right">Rate</th>
              <th className="py-2 px-3 text-right rounded-tr">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-3 text-sm">{index + 1}</td>
                <td className="py-2 px-3 text-sm">{item.materialName}</td>
                <td className="py-2 px-3 text-sm">{item.hsnCode}</td>
                <td className="py-2 px-3 text-sm text-right">{item.quantity}</td>
                <td className="py-2 px-3 text-sm text-right">{formatCurrency(item.rate)}</td>
                <td className="py-2 px-3 text-sm text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-64">
            <div className="flex justify-between py-1 text-sm">
              <span className="text-gray-500">Subtotal:</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.gstEnabled && (
              <>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gray-500">CGST @9%:</span>
                  <span>{formatCurrency(invoice.cgst)}</span>
                </div>
                <div className="flex justify-between py-1 text-sm">
                  <span className="text-gray-500">SGST @9%:</span>
                  <span>{formatCurrency(invoice.sgst)}</span>
                </div>
              </>
            )}
            <div className="border-t border-marble-border mt-2 pt-2">
              <div className="flex justify-between py-1 font-bold bg-brand-green-light px-3 rounded">
                <span>TOTAL:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <p className="text-sm mb-6 italic text-gray-600">
          <strong>Amount in Words:</strong> {numberToWords(invoice.total)}
        </p>

        {invoice.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-6">
            <p className="text-sm"><strong>Notes:</strong> {invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { InvoiceData } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search.trim()) params.set('search', search.trim())
      if (dateFrom) params.set('from', dateFrom)
      if (dateTo) params.set('to', dateTo)

      const res = await fetch(`/api/invoices?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) setInvoices(data)
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [search, dateFrom, dateTo])

  useEffect(() => {
    const timeout = setTimeout(fetchInvoices, 300)
    return () => clearTimeout(timeout)
  }, [fetchInvoices])

  return (
    <div className="min-h-screen bg-marble-bg">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-brand-green hover:underline mb-1 inline-block"
          >
            &larr; Back to Home
          </Link>
          <h1 className="text-2xl font-bold text-brand-green">Invoices</h1>
        </div>

        <div className="bg-white rounded-xl border border-marble-border p-4 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by invoice #, customer name, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3 items-end">
              <Input
                label="From"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <Input
                label="To"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              {(search || dateFrom || dateTo) && (
                <Button
                  type="button"
                  variant="secondary"
                  className="text-sm whitespace-nowrap"
                  onClick={() => {
                    setSearch('')
                    setDateFrom('')
                    setDateTo('')
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-marble-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              No invoices found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-brand-green bg-brand-green-light/50">
                    <th className="py-3 px-4 text-left font-semibold text-brand-green">
                      Invoice #
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-brand-green">
                      Date
                    </th>
                    <th className="py-3 px-4 text-left font-semibold text-brand-green">
                      Customer
                    </th>
                    <th className="py-3 px-4 text-right font-semibold text-brand-green">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-marble-border hover:bg-marble-bg/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-brand-green font-medium hover:underline"
                        >
                          {invoice.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDate(invoice.date)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">
                          {invoice.customerName}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {invoice.customerPhone}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold">
                        {formatCurrency(invoice.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

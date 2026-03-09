'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { LineItem, MaterialData, InvoiceFormData } from '@/types'
import CustomerSection from '@/components/invoice/CustomerSection'
import MaterialTable from '@/components/invoice/MaterialTable'
import TaxToggle from '@/components/invoice/TaxToggle'
import OptionalFields from '@/components/invoice/OptionalFields'
import InvoiceSummary from '@/components/invoice/InvoiceSummary'
import Button from '@/components/ui/Button'

const emptyItem: LineItem = {
  materialName: '',
  hsnCode: '',
  quantity: 0,
  rate: 0,
  amount: 0,
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const [materials, setMaterials] = useState<MaterialData[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<InvoiceFormData>({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerGstin: '',
    items: [{ ...emptyItem }],
    vehicleNumber: '',
    ewayBill: '',
    notes: '',
    gstEnabled: true,
  })

  useEffect(() => {
    fetch('/api/materials')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setMaterials(data)
      })
      .catch(() => {})
  }, [])

  const subtotal = useMemo(
    () => formData.items.reduce((sum, item) => sum + item.amount, 0),
    [formData.items]
  )

  const cgst = useMemo(
    () => (formData.gstEnabled ? Math.round(subtotal * 0.09 * 100) / 100 : 0),
    [subtotal, formData.gstEnabled]
  )

  const sgst = useMemo(
    () => (formData.gstEnabled ? Math.round(subtotal * 0.09 * 100) / 100 : 0),
    [subtotal, formData.gstEnabled]
  )

  const total = useMemo(
    () => Math.round((subtotal + cgst + sgst) * 100) / 100,
    [subtotal, cgst, sgst]
  )

  function handleCustomerChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  function handleItemsChange(items: LineItem[]) {
    setFormData((prev) => ({ ...prev, items }))
  }

  function handleOptionalChange(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      setError('Customer name and phone are required.')
      return
    }

    if (formData.items.every((item) => !item.materialName.trim())) {
      setError('At least one material is required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to create invoice')
      }

      const data = await res.json()
      router.push(`/invoices/${data.id}`)
    } catch {
      setError('Failed to create invoice. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-marble-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/"
              className="text-sm text-brand-green hover:underline mb-1 inline-block"
            >
              &larr; Back to Home
            </Link>
            <h1 className="text-2xl font-bold text-brand-green">Create Invoice</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white rounded-xl border border-marble-border p-6 shadow-sm">
            <CustomerSection formData={formData} onChange={handleCustomerChange} />
          </div>

          <div className="bg-white rounded-xl border border-marble-border p-6 shadow-sm">
            <MaterialTable
              items={formData.items}
              materials={materials}
              onItemsChange={handleItemsChange}
            />
          </div>

          <div className="bg-white rounded-xl border border-marble-border p-6 shadow-sm space-y-6">
            <TaxToggle
              enabled={formData.gstEnabled}
              onChange={(enabled) =>
                setFormData((prev) => ({ ...prev, gstEnabled: enabled }))
              }
            />

            <InvoiceSummary
              subtotal={subtotal}
              cgst={cgst}
              sgst={sgst}
              total={total}
              gstEnabled={formData.gstEnabled}
            />
          </div>

          <div className="bg-white rounded-xl border border-marble-border p-6 shadow-sm">
            <OptionalFields
              vehicleNumber={formData.vehicleNumber}
              ewayBill={formData.ewayBill}
              notes={formData.notes}
              onChange={handleOptionalChange}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={submitting} className="px-8 py-3 text-base">
              {submitting ? 'Generating...' : 'Generate Invoice'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

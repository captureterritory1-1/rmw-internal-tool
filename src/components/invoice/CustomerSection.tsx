'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'

interface CustomerFormData {
  customerName: string
  customerPhone: string
  customerAddress: string
  customerGstin: string
}

interface CustomerSectionProps {
  formData: CustomerFormData
  onChange: (field: keyof CustomerFormData, value: string) => void
}

export default function CustomerSection({ formData, onChange }: CustomerSectionProps) {
  const [customerFound, setCustomerFound] = useState(false)

  async function handlePhoneBlur() {
    const phone = formData.customerPhone.trim()
    if (phone.length !== 10) {
      setCustomerFound(false)
      return
    }

    try {
      const res = await fetch(`/api/customers?phone=${phone}`)
      const data = await res.json()

      if (data && data.name) {
        onChange('customerName', data.name)
        if (data.address) onChange('customerAddress', data.address)
        if (data.gstin) onChange('customerGstin', data.gstin)
        setCustomerFound(true)
      } else {
        setCustomerFound(false)
      }
    } catch {
      setCustomerFound(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-brand-green">Customer Details</h2>
        {customerFound && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-green-light text-brand-green">
            Customer found
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          type="tel"
          placeholder="10-digit phone number"
          value={formData.customerPhone}
          onChange={(e) => onChange('customerPhone', e.target.value)}
          onBlur={handlePhoneBlur}
          maxLength={10}
        />
        <Input
          label="Customer Name"
          placeholder="Full name"
          value={formData.customerName}
          onChange={(e) => onChange('customerName', e.target.value)}
        />
        <Input
          label="Address"
          placeholder="Customer address"
          value={formData.customerAddress}
          onChange={(e) => onChange('customerAddress', e.target.value)}
        />
        <Input
          label="GSTIN"
          placeholder="GST number (optional)"
          value={formData.customerGstin}
          onChange={(e) => onChange('customerGstin', e.target.value)}
        />
      </div>
    </section>
  )
}

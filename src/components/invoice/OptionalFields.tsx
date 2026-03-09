'use client'

import Input from '@/components/ui/Input'

interface OptionalFieldsProps {
  vehicleNumber: string
  ewayBill: string
  notes: string
  onChange: (field: 'vehicleNumber' | 'ewayBill' | 'notes', value: string) => void
}

export default function OptionalFields({
  vehicleNumber,
  ewayBill,
  notes,
  onChange,
}: OptionalFieldsProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-brand-green">Additional Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Vehicle Number"
          placeholder="e.g. RJ-14-AB-1234"
          value={vehicleNumber}
          onChange={(e) => onChange('vehicleNumber', e.target.value)}
        />
        <Input
          label="E-Way Bill Number"
          placeholder="E-Way bill number (optional)"
          value={ewayBill}
          onChange={(e) => onChange('ewayBill', e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700">Notes</label>
        <textarea
          className="px-3 py-2 border border-marble-border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent transition-shadow resize-y min-h-[80px]"
          placeholder="Additional notes (optional)"
          rows={3}
          value={notes}
          onChange={(e) => onChange('notes', e.target.value)}
        />
      </div>
    </section>
  )
}

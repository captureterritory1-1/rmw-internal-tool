'use client'

import Toggle from '@/components/ui/Toggle'

interface TaxToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export default function TaxToggle({ enabled, onChange }: TaxToggleProps) {
  return (
    <div className="flex items-center">
      <Toggle
        label="Apply GST (CGST 9% + SGST 9%)"
        checked={enabled}
        onChange={onChange}
      />
    </div>
  )
}

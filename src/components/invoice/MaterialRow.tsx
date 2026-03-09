'use client'

import type { LineItem, MaterialData } from '@/types'

interface MaterialRowProps {
  item: LineItem
  index: number
  materials: MaterialData[]
  onChange: (index: number, field: keyof LineItem, value: string | number) => void
  onRemove: (index: number) => void
}

export default function MaterialRow({
  item,
  index,
  materials,
  onChange,
  onRemove,
}: MaterialRowProps) {
  function handleMaterialChange(value: string) {
    onChange(index, 'materialName', value)

    const match = materials.find(
      (m) => m.name.toLowerCase() === value.toLowerCase()
    )
    if (match) {
      onChange(index, 'hsnCode', match.hsnCode)
      onChange(index, 'rate', match.defaultRate)
    }
  }

  return (
    <tr className="border-b border-marble-border">
      <td className="py-2 pr-2">
        <input
          list={`materials-list-${index}`}
          className="w-full px-2 py-1.5 border border-marble-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="Select material"
          value={item.materialName}
          onChange={(e) => handleMaterialChange(e.target.value)}
        />
        <datalist id={`materials-list-${index}`}>
          {materials.map((m) => (
            <option key={m.id} value={m.name} />
          ))}
        </datalist>
      </td>
      <td className="py-2 px-2">
        <input
          className="w-full px-2 py-1.5 border border-marble-border rounded text-sm bg-gray-50 text-gray-600"
          value={item.hsnCode}
          readOnly
          tabIndex={-1}
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          min="0"
          step="any"
          className="w-full px-2 py-1.5 border border-marble-border rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="0"
          value={item.quantity || ''}
          onChange={(e) => onChange(index, 'quantity', parseFloat(e.target.value) || 0)}
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          min="0"
          step="any"
          className="w-full px-2 py-1.5 border border-marble-border rounded text-sm text-right focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          placeholder="0.00"
          value={item.rate || ''}
          onChange={(e) => onChange(index, 'rate', parseFloat(e.target.value) || 0)}
        />
      </td>
      <td className="py-2 px-2">
        <input
          className="w-full px-2 py-1.5 border border-marble-border rounded text-sm text-right bg-gray-50 text-gray-600"
          value={item.amount.toFixed(2)}
          readOnly
          tabIndex={-1}
        />
      </td>
      <td className="py-2 pl-2">
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          title="Remove row"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </td>
    </tr>
  )
}

'use client'

import type { LineItem, MaterialData } from '@/types'
import MaterialRow from './MaterialRow'
import Button from '@/components/ui/Button'

interface MaterialTableProps {
  items: LineItem[]
  materials: MaterialData[]
  onItemsChange: (items: LineItem[]) => void
}

const emptyItem: LineItem = {
  materialName: '',
  hsnCode: '',
  quantity: 0,
  rate: 0,
  amount: 0,
}

export default function MaterialTable({
  items,
  materials,
  onItemsChange,
}: MaterialTableProps) {
  function handleChange(index: number, field: keyof LineItem, value: string | number) {
    const updated = items.map((item, i) => {
      if (i !== index) return item
      const newItem = { ...item, [field]: value }
      newItem.amount = Math.round(newItem.quantity * newItem.rate * 100) / 100
      return newItem
    })
    onItemsChange(updated)
  }

  function handleRemove(index: number) {
    if (items.length <= 1) return
    onItemsChange(items.filter((_, i) => i !== index))
  }

  function handleAdd() {
    onItemsChange([...items, { ...emptyItem }])
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-brand-green">Materials</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-brand-green text-left">
              <th className="py-2 pr-2 font-semibold text-brand-green">Material</th>
              <th className="py-2 px-2 font-semibold text-brand-green w-24">HSN</th>
              <th className="py-2 px-2 font-semibold text-brand-green w-24 text-right">Qty</th>
              <th className="py-2 px-2 font-semibold text-brand-green w-28 text-right">Rate</th>
              <th className="py-2 px-2 font-semibold text-brand-green w-28 text-right">Amount</th>
              <th className="py-2 pl-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <MaterialRow
                key={index}
                item={item}
                index={index}
                materials={materials}
                onChange={handleChange}
                onRemove={handleRemove}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Button type="button" variant="secondary" onClick={handleAdd} className="text-sm">
        + Add Row
      </Button>
    </section>
  )
}

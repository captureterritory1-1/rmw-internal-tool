import { formatCurrency } from '@/lib/utils'

interface InvoiceSummaryProps {
  subtotal: number
  cgst: number
  sgst: number
  total: number
  gstEnabled: boolean
}

export default function InvoiceSummary({
  subtotal,
  cgst,
  sgst,
  total,
  gstEnabled,
}: InvoiceSummaryProps) {
  return (
    <div className="flex justify-end">
      <div className="w-full max-w-xs space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {gstEnabled && (
          <>
            <div className="flex justify-between">
              <span className="text-gray-600">CGST (9%)</span>
              <span className="font-medium">{formatCurrency(cgst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">SGST (9%)</span>
              <span className="font-medium">{formatCurrency(sgst)}</span>
            </div>
          </>
        )}

        <div className="flex justify-between py-2 px-3 -mx-3 rounded-lg bg-brand-green-light border border-brand-green/20">
          <span className="font-semibold text-brand-green">Grand Total</span>
          <span className="font-bold text-brand-green text-base">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  )
}

export interface LineItem {
  materialName: string
  hsnCode: string
  quantity: number
  rate: number
  amount: number
}

export interface InvoiceFormData {
  customerName: string
  customerPhone: string
  customerAddress: string
  customerGstin: string
  items: LineItem[]
  vehicleNumber: string
  ewayBill: string
  notes: string
  gstEnabled: boolean
}

export interface InvoiceData {
  id: number
  invoiceNumber: string
  date: string
  customerName: string
  customerPhone: string
  customerAddress: string | null
  customerGstin: string | null
  items: LineItem[]
  subtotal: number
  cgst: number
  sgst: number
  total: number
  gstEnabled: boolean
  vehicleNumber: string | null
  ewayBill: string | null
  notes: string | null
  createdAt: string
}

export interface MaterialData {
  id: number
  name: string
  hsnCode: string
  defaultRate: number
}

export interface CustomerData {
  id: number
  name: string
  phone: string
  address: string | null
  gstin: string | null
}

import { numberToWords, formatCurrency, formatDate } from '../utils'
import * as fs from 'fs'
import * as path from 'path'

interface InvoiceItem {
  materialName: string
  hsnCode: string
  quantity: number
  rate: number
  amount: number
}

interface Invoice {
  invoiceNumber: string
  date: string
  customerName: string
  customerPhone: string
  customerAddress: string | null
  customerGstin: string | null
  items: InvoiceItem[]
  subtotal: number
  cgst: number
  sgst: number
  total: number
  gstEnabled: boolean
  vehicleNumber: string | null
  ewayBill: string | null
  notes: string | null
}

export function buildInvoiceHtml(invoice: Invoice): string {
  const formattedDate = formatDate(invoice.date)

  // Read logo and embed as base64
  let logoBase64 = ''
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoBuffer = fs.readFileSync(logoPath)
    logoBase64 = logoBuffer.toString('base64')
  } catch {
    // Logo will be omitted if file not found
  }

  const itemRows = invoice.items
    .map(
      (item, i) => `
      <tr class="${i % 2 === 1 ? 'alt-row' : ''}">
        <td class="center">${i + 1}</td>
        <td>${escapeHtml(item.materialName)}</td>
        <td class="center">${escapeHtml(item.hsnCode)}</td>
        <td class="right">${item.quantity.toFixed(2)}</td>
        <td class="right">${formatCurrency(item.rate)}</td>
        <td class="right">${formatCurrency(item.amount)}</td>
      </tr>`
    )
    .join('')

  const vehicleRow = invoice.vehicleNumber
    ? `<div class="meta-row"><span class="meta-label">Vehicle No:</span> ${escapeHtml(invoice.vehicleNumber)}</div>`
    : ''

  const ewayRow = invoice.ewayBill
    ? `<div class="meta-row"><span class="meta-label">E-Way Bill:</span> ${escapeHtml(invoice.ewayBill)}</div>`
    : ''

  const customerAddress = invoice.customerAddress
    ? `<div class="bill-row">${escapeHtml(invoice.customerAddress)}</div>`
    : ''

  const customerGstin = invoice.customerGstin
    ? `<div class="bill-row"><span class="bill-label">GSTIN:</span> ${escapeHtml(invoice.customerGstin)}</div>`
    : ''

  const gstRows = invoice.gstEnabled
    ? `
      <tr class="totals-row">
        <td>CGST @9%</td>
        <td class="right">${formatCurrency(invoice.cgst)}</td>
      </tr>
      <tr class="totals-row">
        <td>SGST @9%</td>
        <td class="right">${formatCurrency(invoice.sgst)}</td>
      </tr>`
    : ''

  const notesSection = invoice.notes
    ? `<div class="notes"><strong>Notes:</strong> ${escapeHtml(invoice.notes)}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${escapeHtml(invoice.invoiceNumber)}</title>
  <style>
    @page {
      size: A4;
      margin: 10mm;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-container { box-shadow: none; }
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 12px;
      color: #333;
      background: #FFFFFF;
      line-height: 1.5;
    }

    .page-container {
      max-width: 210mm;
      margin: 0 auto;
      padding: 24px 28px;
      background: #FFFFFF;
    }

    /* ── Header ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 14px;
      border-bottom: 3px solid #2F4F4F;
      margin-bottom: 18px;
    }

    .company-info {
      max-width: 60%;
    }

    .company-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 4px;
    }

    .company-logo {
      flex-shrink: 0;
    }

    .company-logo img {
      height: 45px;
      width: auto;
    }

    .company-name {
      font-size: 20px;
      font-weight: 700;
      color: #2F4F4F;
      white-space: nowrap;
      letter-spacing: 0.5px;
      margin-bottom: 0;
    }

    .company-tagline {
      font-size: 11px;
      color: #777;
      font-style: italic;
      margin-bottom: 8px;
    }

    .company-detail {
      font-size: 10.5px;
      color: #555;
      line-height: 1.6;
    }

    .invoice-meta {
      text-align: right;
    }

    .invoice-title {
      font-size: 24px;
      font-weight: 700;
      color: #2F4F4F;
      letter-spacing: 1px;
      margin-bottom: 8px;
    }

    .meta-row {
      font-size: 11px;
      color: #444;
      margin-bottom: 3px;
    }

    .meta-label {
      font-weight: 600;
      color: #2F4F4F;
    }

    /* ── Bill To ── */
    .bill-to-section {
      margin-bottom: 18px;
    }

    .section-header {
      background: #2F4F4F;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: 6px 12px;
      margin-bottom: 10px;
    }

    .bill-details {
      padding: 0 12px;
    }

    .bill-row {
      font-size: 11.5px;
      color: #444;
      margin-bottom: 3px;
    }

    .bill-name {
      font-size: 13px;
      font-weight: 600;
      color: #2F4F4F;
      margin-bottom: 3px;
    }

    .bill-label {
      font-weight: 600;
      color: #555;
    }

    /* ── Items Table ── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 11px;
    }

    .items-table thead th {
      background: #2F4F4F;
      color: #FFFFFF;
      font-weight: 600;
      padding: 8px 10px;
      text-align: left;
      font-size: 10.5px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }

    .items-table thead th.center { text-align: center; }
    .items-table thead th.right { text-align: right; }

    .items-table tbody td {
      padding: 7px 10px;
      border-bottom: 1px solid #E8E8E8;
    }

    .items-table tbody td.center { text-align: center; }
    .items-table tbody td.right { text-align: right; }

    .items-table tbody tr.alt-row {
      background: #F7FAFA;
    }

    .items-table tbody tr:hover {
      background: #E8F0F0;
    }

    /* ── Totals ── */
    .totals-wrapper {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .totals-table {
      width: 280px;
      border-collapse: collapse;
      font-size: 11.5px;
    }

    .totals-table td {
      padding: 5px 10px;
    }

    .totals-table .right {
      text-align: right;
      font-family: 'Segoe UI', monospace;
    }

    .totals-row td {
      color: #444;
    }

    .totals-divider td {
      border-top: 1px dashed #999;
      padding-top: 8px;
    }

    .grand-total-row td {
      background: #E8F0F0;
      border: 2px solid #2F4F4F;
      font-size: 13px;
      font-weight: 700;
      color: #2F4F4F;
      padding: 8px 10px;
    }

    /* ── Amount in Words ── */
    .amount-words {
      background: #F7FAFA;
      border-left: 3px solid #2F4F4F;
      padding: 8px 14px;
      font-size: 11px;
      color: #444;
      margin-bottom: 20px;
    }

    .amount-words strong {
      color: #2F4F4F;
    }

    /* ── Notes ── */
    .notes {
      font-size: 10.5px;
      color: #555;
      margin-bottom: 18px;
      padding: 6px 12px;
      background: #FFFDE7;
      border-left: 3px solid #FBC02D;
    }

    /* ── Footer ── */
    .footer {
      display: flex;
      justify-content: space-between;
      gap: 24px;
      border-top: 1px solid #DDD;
      padding-top: 14px;
      margin-bottom: 20px;
    }

    .footer-section {
      flex: 1;
    }

    .footer-title {
      font-size: 10px;
      font-weight: 700;
      color: #2F4F4F;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 6px;
      border-bottom: 1px solid #CCC;
      padding-bottom: 4px;
    }

    .footer-content {
      font-size: 10px;
      color: #555;
      line-height: 1.7;
    }

    .footer-content ol {
      padding-left: 14px;
      margin: 0;
    }

    .footer-content ol li {
      margin-bottom: 1px;
    }

    .bank-row {
      display: flex;
      gap: 6px;
    }

    .bank-label {
      font-weight: 600;
      color: #444;
      min-width: 50px;
    }

    /* ── Signature ── */
    .signature-block {
      text-align: right;
      margin-top: 10px;
      padding-top: 10px;
    }

    .signature-company {
      font-size: 12px;
      font-weight: 600;
      color: #2F4F4F;
      margin-bottom: 40px;
    }

    .signature-line {
      font-size: 10.5px;
      color: #555;
      border-top: 1px solid #999;
      display: inline-block;
      padding-top: 4px;
      min-width: 180px;
    }
  </style>
</head>
<body>
  <div class="page-container">

    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <div class="company-header">
          <div class="company-logo">
            ${logoBase64 ? `<img src="data:image/png;base64,${logoBase64}" alt="RMW Logo">` : ''}
          </div>
          <div class="company-name">RAJASTHAN MARBLE WORLD</div>
        </div>
        <div class="company-tagline">Dealers of Exclusive Marbles &amp; Granites</div>
        <div class="company-detail">
          Plot No. 40 &amp; 41, Adarsha Nagar, Chengicherla (V) R.R. Dist, Hyderabad<br>
          Phone: 98666 35165 &nbsp;|&nbsp; Email: rajasthanmarbleworld17@gmail.com
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">QUOTATION</div>
        <div class="meta-row"><span class="meta-label">Date:</span> ${formattedDate}</div>
        <div class="meta-row"><span class="meta-label">Invoice #:</span> ${escapeHtml(invoice.invoiceNumber)}</div>
        ${vehicleRow}
        ${ewayRow}
      </div>
    </div>

    <!-- Bill To -->
    <div class="bill-to-section">
      <div class="section-header">Bill To</div>
      <div class="bill-details">
        <div class="bill-name">${escapeHtml(invoice.customerName)}</div>
        ${customerAddress}
        <div class="bill-row"><span class="bill-label">Phone:</span> ${escapeHtml(invoice.customerPhone)}</div>
        ${customerGstin}
      </div>
    </div>

    <!-- Items Table -->
    <table class="items-table">
      <thead>
        <tr>
          <th class="center" style="width:40px">#</th>
          <th>Material Description</th>
          <th class="center" style="width:80px">HSN Code</th>
          <th class="right" style="width:80px">Qty (Sqft)</th>
          <th class="right" style="width:90px">Rate (\u20B9)</th>
          <th class="right" style="width:100px">Amount (\u20B9)</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals-wrapper">
      <table class="totals-table">
        <tr class="totals-row">
          <td>Subtotal</td>
          <td class="right">${formatCurrency(invoice.subtotal)}</td>
        </tr>
        ${gstRows}
        <tr class="totals-divider grand-total-row">
          <td>GRAND TOTAL</td>
          <td class="right">${formatCurrency(invoice.total)}</td>
        </tr>
      </table>
    </div>

    <!-- Amount in Words -->
    <div class="amount-words">
      <strong>Amount in Words:</strong> ${numberToWords(invoice.total)}
    </div>

    ${notesSection}

    <!-- Footer -->
    <div class="footer">
      <div class="footer-section">
        <div class="footer-title">Terms &amp; Conditions</div>
        <div class="footer-content">
          <ol>
            <li>Goods once sold will not be taken back.</li>
            <li>Marble &amp; Granite are natural products &mdash; slight variation in color/pattern is normal.</li>
            <li>Payment must be cleared before delivery.</li>
            <li>18% interest charged for delayed payments.</li>
            <li>Subject to Hyderabad jurisdiction.</li>
          </ol>
        </div>
      </div>
      <div class="footer-section">
        <div class="footer-title">Bank Details</div>
        <div class="footer-content">
          <div class="bank-row"><span class="bank-label">Bank:</span> Indian Overseas Bank</div>
          <div class="bank-row"><span class="bank-label">A/C No:</span> 188902000000278</div>
          <div class="bank-row"><span class="bank-label">Branch:</span> Uppal</div>
          <div class="bank-row"><span class="bank-label">IFSC:</span> IOBA0001889</div>
        </div>
      </div>
    </div>

    <!-- Signature -->
    <div class="signature-block">
      <div class="signature-company">For Rajasthan Marble World</div>
      <div class="signature-line">Authorized Signatory</div>
    </div>

  </div>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

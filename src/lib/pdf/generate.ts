import { buildInvoiceHtml } from './template'
import type { InvoiceData } from '@/types'

export async function generateInvoicePdf(invoice: InvoiceData): Promise<Buffer> {
  const html = buildInvoiceHtml(invoice)

  // Check if running inside Electron
  const isElectron = !!(process.versions && (process.versions as Record<string, string>).electron)

  if (isElectron) {
    // Running inside Electron — use BrowserWindow.printToPDF via the electron/pdf module
    // The API route runs in the same Node.js process as Electron main process
    const { generatePdfFromHtml } = require('../../../electron/dist/pdf')
    return generatePdfFromHtml(html)
  }

  // Fallback: use Puppeteer for development (next dev without Electron)
  const puppeteer = require('puppeteer')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        bottom: '10mm',
        left: '10mm',
        right: '10mm',
      },
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

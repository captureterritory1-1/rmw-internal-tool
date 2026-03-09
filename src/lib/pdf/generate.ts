import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'
import { buildInvoiceHtml } from './template'
import type { InvoiceData } from '@/types'

export async function generateInvoicePdf(invoice: InvoiceData): Promise<Buffer> {
  const html = buildInvoiceHtml(invoice)

  // Check if running inside Electron
  const isElectron = !!(process.versions && (process.versions as Record<string, string>).electron)

  if (isElectron) {
    const { generatePdfFromHtml } = require('../../../electron/dist/pdf')
    return generatePdfFromHtml(html)
  }

  // Use @sparticuz/chromium for serverless (Vercel) and local dev
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
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

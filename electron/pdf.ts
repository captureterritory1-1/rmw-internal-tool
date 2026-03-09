import { BrowserWindow } from 'electron'

export async function generatePdfFromHtml(html: string): Promise<Buffer> {
  const win = new BrowserWindow({
    show: false,
    width: 794,  // A4 width at 96 DPI
    height: 1123, // A4 height at 96 DPI
    webPreferences: {
      offscreen: true,
    },
  })

  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

    // Wait for content to render
    await new Promise((resolve) => setTimeout(resolve, 500))

    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      pageSize: 'A4',
      margins: {
        top: 0.394,      // 10mm in inches
        bottom: 0.394,
        left: 0.394,
        right: 0.394,
      },
    })

    return Buffer.from(pdfBuffer)
  } finally {
    win.close()
  }
}

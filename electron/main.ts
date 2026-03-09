import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { spawn, ChildProcess } from 'child_process'
import { generatePdfFromHtml } from './pdf'

const isDev = !app.isPackaged

let mainWindow: BrowserWindow | null = null
let serverProcess: ChildProcess | null = null
let serverPort = 3000

function getDbPath(): string {
  if (isDev) {
    return path.join(__dirname, '..', '..', 'dev.db')
  }
  const userDataPath = app.getPath('userData')
  return path.join(userDataPath, 'rmw.db')
}

function ensureDatabase(): void {
  const dbPath = getDbPath()

  if (!fs.existsSync(dbPath)) {
    // Copy seed database from app resources on first launch
    const seedDbPath = isDev
      ? path.join(__dirname, '..', '..', 'dev.db')
      : path.join(process.resourcesPath, 'seed.db')

    if (fs.existsSync(seedDbPath)) {
      fs.copyFileSync(seedDbPath, dbPath)
      console.log('Database copied to:', dbPath)
    } else {
      console.error('Seed database not found at:', seedDbPath)
    }
  }

  process.env.DATABASE_URL = `file:${dbPath}`
}

function getAvailablePort(): Promise<number> {
  return new Promise((resolve) => {
    const net = require('net')
    const server = net.createServer()
    server.listen(0, () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
  })
}

async function startNextServer(): Promise<number> {
  if (isDev) {
    // In dev, assume next dev is running on port 3000
    return 3000
  }

  const port = await getAvailablePort()
  const standaloneDir = path.join(process.resourcesPath, 'standalone')
  const serverPath = path.join(standaloneDir, 'server.js')

  return new Promise((resolve, reject) => {
    const env = {
      ...process.env,
      PORT: String(port),
      HOSTNAME: 'localhost',
      NODE_ENV: 'production',
    }

    serverProcess = spawn(process.execPath, [serverPath], {
      cwd: standaloneDir,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    serverProcess.stdout?.on('data', (data: Buffer) => {
      const output = data.toString()
      console.log('[Next.js]', output)
      if (output.includes('Ready') || output.includes('started')) {
        resolve(port)
      }
    })

    serverProcess.stderr?.on('data', (data: Buffer) => {
      console.error('[Next.js Error]', data.toString())
    })

    serverProcess.on('error', (err) => {
      console.error('Failed to start Next.js server:', err)
      reject(err)
    })

    // Fallback: resolve after 3 seconds even if no "Ready" message
    setTimeout(() => resolve(port), 3000)
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'RMW Invoice Tool',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.loadURL(`http://localhost:${serverPort}`)

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC handler for PDF generation
ipcMain.handle('generate-pdf', async (_event, html: string) => {
  return generatePdfFromHtml(html)
})

app.whenReady().then(async () => {
  ensureDatabase()

  try {
    serverPort = await startNextServer()
    console.log(`Next.js server running on port ${serverPort}`)
  } catch (err) {
    console.error('Failed to start server:', err)
    app.quit()
    return
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill()
    serverProcess = null
  }
})

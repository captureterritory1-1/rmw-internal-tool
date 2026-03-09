import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  generatePdf: (html: string) => ipcRenderer.invoke('generate-pdf', html),
})

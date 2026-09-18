// Exercised manually in Chrome/Edge — File System Access API is unavailable under jsdom.
import { emptyAppData, type AppData, type StorageAdapter } from './storage'

export async function pickFolder(): Promise<FileSystemDirectoryHandle> {
  // @ts-expect-error showDirectoryPicker is not yet in all TS lib versions
  return await window.showDirectoryPicker({ mode: 'readwrite' })
}

export function createFileSystemStorage(dirHandle: FileSystemDirectoryHandle): StorageAdapter {
  async function writeFile(name: string, contents: string | Blob) {
    const fh = await dirHandle.getFileHandle(name, { create: true })
    const w = await fh.createWritable()
    await w.write(contents)
    await w.close()
  }
  return {
    async load(): Promise<AppData> {
      try {
        const fh = await dirHandle.getFileHandle('data.json')
        const text = await (await fh.getFile()).text()
        return { ...emptyAppData(), ...JSON.parse(text) }
      } catch {
        return emptyAppData()
      }
    },
    async save(data) {
      await writeFile('data.json', JSON.stringify(data, null, 2))
    },
    async saveReceipt(file) {
      const receipts = await dirHandle.getDirectoryHandle('receipts', { create: true })
      const name = `${Date.now()}-${file.name}`
      const fh = await receipts.getFileHandle(name, { create: true })
      const w = await fh.createWritable()
      await w.write(file)
      await w.close()
      return name
    },
    async readReceiptUrl(name) {
      try {
        const receipts = await dirHandle.getDirectoryHandle('receipts')
        const fh = await receipts.getFileHandle(name)
        return URL.createObjectURL(await fh.getFile())
      } catch {
        return null
      }
    },
  }
}

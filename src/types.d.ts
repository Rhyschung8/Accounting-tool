// Type stubs for File System Access API (not yet in standard lib)
interface Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
}

interface FileSystemDirectoryHandle {
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>
  entries(): AsyncIterable<[string, FileSystemHandle]>
}

interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>
}

interface FileSystemWritableFileStream {
  write(data: BufferSource | Blob | string): Promise<undefined>
  seek(position: number): Promise<undefined>
  truncate(size: number): Promise<undefined>
  close(): Promise<undefined>
}

interface FileSystemHandle {
  kind: 'file' | 'directory'
  name: string
}

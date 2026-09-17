// Type stubs for File System Access API (not yet in standard lib)
interface Window {
  showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
}

interface FileSystemDirectoryHandle {
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>
  entries(): AsyncIterable<[string, FileSystemHandle]>
  queryPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
  requestPermission(descriptor: { mode: 'read' | 'readwrite' }): Promise<PermissionState>
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

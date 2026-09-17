// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createStore } from './state/store'
import { createMemoryStorage } from './storage/memoryStorage'
import { createFileSystemStorage } from './storage/fileSystemStorage'
import './styles.css'

async function boot() {
  let storage = createMemoryStorage()
  let dirHandle: FileSystemDirectoryHandle | null = null
  let onFolderPicked: ((handle: FileSystemDirectoryHandle) => void) | undefined

  // R13: try to restore a previously-chosen folder from IndexedDB
  if (typeof window.showDirectoryPicker === 'function') {
    try {
      const { loadDirHandle, saveDirHandle } = await import('./storage/handleStore')

      const saved = await loadDirHandle()
      if (saved) {
        const perm: PermissionState = await saved.queryPermission({ mode: 'readwrite' })
        if (perm === 'granted') {
          dirHandle = saved
          storage = createFileSystemStorage(dirHandle)
        } else {
          const requested: PermissionState = await saved.requestPermission({ mode: 'readwrite' })
          if (requested === 'granted') {
            dirHandle = saved
            storage = createFileSystemStorage(dirHandle)
          }
        }
      }

      // R13: when FirstRun picks a folder, save the handle to IDB so next launch reopens it.
      // After saving we reload so boot() re-runs and creates a FS-backed store from scratch.
      onFolderPicked = async (handle: FileSystemDirectoryHandle) => {
        await saveDirHandle(handle)
        window.location.reload()
      }
    } catch {
      // IDB unavailable or handle invalid — fall through to memory storage
    }
  }

  const store = createStore(storage)

  // Apply saved text-size to <html> before first render
  store.init().then(() => {
    const textSize = store.getState().settings.textSize
    document.documentElement.dataset.textSize = textSize
  })

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App store={store} dirHandle={dirHandle} onFolderPicked={onFolderPicked} />
    </React.StrictMode>,
  )
}

boot()

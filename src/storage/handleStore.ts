// Exercised manually in Chrome/Edge — IndexedDB + File System Access unavailable under jsdom.

const DB_NAME = 'piano-accounts'
const STORE_NAME = 'handles'
const HANDLE_KEY = 'dirHandle'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveDirHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const req = store.put(handle, HANDLE_KEY)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
    tx.oncomplete = () => db.close()
  })
}

export async function loadDirHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(HANDLE_KEY)
    req.onsuccess = () => {
      db.close()
      resolve((req.result as FileSystemDirectoryHandle | undefined) ?? null)
    }
    req.onerror = () => {
      db.close()
      reject(req.error)
    }
  })
}

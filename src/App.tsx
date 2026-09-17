// src/App.tsx
import { useEffect, useState } from 'react'
import { StoreProvider, useStore } from './state/useStore'
import type { createStore } from './state/store'
import { FirstRun } from './ui/FirstRun'
import { HomeScreen } from './ui/HomeScreen'

type Store = ReturnType<typeof createStore>

interface AppProps {
  store: Store
  dirHandle?: FileSystemDirectoryHandle | null
  /** R13: injected by main.tsx to persist the chosen handle to IDB */
  onFolderPicked?: (handle: FileSystemDirectoryHandle) => void
}

/** Inner shell — must be mounted inside StoreProvider */
function AppShell({
  dirHandle,
  onFolderPicked,
}: {
  dirHandle?: FileSystemDirectoryHandle | null
  onFolderPicked?: (handle: FileSystemDirectoryHandle) => void
}) {
  const { state, setSettings } = useStore()
  const [backupDone, setBackupDone] = useState(false)

  // R9: run weekly backup once on first mount, only in real browsers with a dirHandle
  useEffect(() => {
    if (backupDone) return
    setBackupDone(true)
    if (!dirHandle) return
    if (typeof window.showDirectoryPicker !== 'function') return

    async function runBackup() {
      try {
        const { maybeWeeklyBackup } = await import('./storage/backup')
        const json = JSON.stringify(state, null, 2)
        const newIso = await maybeWeeklyBackup(
          dirHandle!,
          json,
          state.settings.lastBackupAt ?? null,
        )
        if (newIso !== (state.settings.lastBackupAt ?? null)) {
          await setSettings({ lastBackupAt: newIso })
        }
      } catch {
        // Backup failure is non-fatal — do not crash the app
      }
    }

    runBackup()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!state.settings.folderChosen) {
    return (
      <FirstRun
        onComplete={() => { /* folderChosen=true set by FirstRun; store subscription re-renders */ }}
        onFolderPicked={onFolderPicked}
      />
    )
  }

  return <HomeScreen />
}

/**
 * App — accepts a store (prop-injected for tests; main.tsx builds the real one).
 * Wraps in StoreProvider, runs store.init(), then shows FirstRun or HomeScreen.
 */
export default function App({ store, dirHandle, onFolderPicked }: AppProps) {
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    store.init().then(() => setInitialized(true))
  }, [store])

  if (!initialized) return null

  return (
    <StoreProvider store={store}>
      <AppShell dirHandle={dirHandle} onFolderPicked={onFolderPicked} />
    </StoreProvider>
  )
}

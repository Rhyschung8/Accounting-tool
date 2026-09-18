// src/state/useStore.tsx
import { createContext, useContext, useSyncExternalStore } from 'react'
import type { createStore } from './store'

type Store = ReturnType<typeof createStore>
const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ store, children }: { store: Store; children: React.ReactNode }) {
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)
  return { state, ...store }
}

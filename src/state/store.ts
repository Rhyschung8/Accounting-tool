// src/state/store.ts
import type { StorageAdapter, AppData, Settings } from '../storage/storage'
import { makeEntry, type Entry } from '../domain/entry'
import { categorise } from '../domain/categoriser'
import { generateHomeOfficeMonths } from '../domain/homeOffice'
import { getRates } from '../config/taxYears'
import { taxYearOf } from '../domain/taxYear'

type Listener = () => void

export function createStore(adapter: StorageAdapter) {
  let state: AppData
  const listeners = new Set<Listener>()
  const notify = () => listeners.forEach(l => l())
  const persist = async () => { await adapter.save(state); notify() }

  return {
    getState: () => state,
    subscribe(l: Listener) { listeners.add(l); return () => listeners.delete(l) },

    async init() { state = await adapter.load() },

    async addEntry(
      partial: Omit<Parameters<typeof makeEntry>[0], 'category'> & { category?: string },
    ) {
      let category = partial.category
      let claimable = partial.claimable ?? true
      if (partial.type === 'expense' && !category) {
        const r = categorise(partial.description, state.learnedMerchants)
        category = r.category
        claimable = r.claimable
      }
      const entry = makeEntry({ ...partial, category: category ?? 'uncategorised', claimable })
      state.entries.push(entry)
      await persist()
      return entry
    },

    async updateEntry(id: string, patch: Partial<Entry>) {
      state.entries = state.entries.map(e => (e.id === id ? { ...e, ...patch } : e))
      await persist()
    },

    async softDelete(id: string) {
      state.entries = state.entries.map(e => (e.id === id ? { ...e, deletedAt: new Date().toISOString() } : e))
      await persist()
    },

    async restore(id: string) {
      state.entries = state.entries.map(e => (e.id === id ? { ...e, deletedAt: null } : e))
      await persist()
    },

    async purgeExpired(days = 30) {
      const cutoff = Date.now() - days * 86_400_000
      state.entries = state.entries.filter(e => !e.deletedAt || new Date(e.deletedAt).getTime() > cutoff)
      await persist()
    },

    async learnMerchant(merchant: string, category: string) {
      state.learnedMerchants[merchant.toLowerCase()] = category
      await persist()
    },

    async setSettings(patch: Partial<Settings>) {
      state.settings = { ...state.settings, ...patch }
      await persist()
    },

    async regenerateHomeOffice(taxYear: string) {
      // R3 correction: use taxYearOf to match entries spanning TWO calendar years
      state.entries = state.entries.filter(
        e => !(e.type === 'home_office' && e.source === 'auto' && taxYearOf(e.date) === taxYear),
      )
      const generated = generateHomeOfficeMonths(taxYear, state.settings.hoursPerWeekAtHome, getRates(taxYear))
      state.entries.push(...generated)
      await persist()
    },
  }
}

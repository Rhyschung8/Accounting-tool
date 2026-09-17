import { emptyAppData, type AppData, type StorageAdapter, DEFAULT_SETTINGS } from './storage'

export function createMemoryStorage(seed?: Partial<AppData>): StorageAdapter {
  let data: AppData = {
    ...emptyAppData(),
    ...seed,
    settings: { ...DEFAULT_SETTINGS, ...(seed?.settings ?? {}) },
    learnedMerchants: { ...(seed?.learnedMerchants ?? {}) },
  }
  const receipts: Record<string, string> = {}
  return {
    async load() { return structuredClone(data) },
    async save(next) { data = structuredClone(next) },
    async saveReceipt(file) {
      const name = `${Date.now()}-${file.name}`
      receipts[name] = 'blob:memory/' + name
      return name
    },
    async readReceiptUrl(name) { return receipts[name] ?? null },
  }
}

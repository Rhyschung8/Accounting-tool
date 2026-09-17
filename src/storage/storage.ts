import type { Entry } from '../domain/entry'

export interface Settings {
  hoursPerWeekAtHome: number
  otherIncomePence: number
  textSize: 'normal' | 'large' | 'xlarge'
  largePurchaseThresholdPence: number
  folderChosen: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  hoursPerWeekAtHome: 0,
  otherIncomePence: 0,
  textSize: 'large',
  largePurchaseThresholdPence: 50_000,
  folderChosen: false,
}

export interface AppData {
  entries: Entry[]
  settings: Settings
  learnedMerchants: Record<string, string>
}

export function emptyAppData(): AppData {
  return { entries: [], settings: { ...DEFAULT_SETTINGS }, learnedMerchants: {} }
}

export interface StorageAdapter {
  load(): Promise<AppData>
  save(data: AppData): Promise<void>
  saveReceipt(file: File): Promise<string>
  readReceiptUrl(name: string): Promise<string | null>
}

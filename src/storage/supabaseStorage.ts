import type { SupabaseClient } from '@supabase/supabase-js'
import { emptyAppData, DEFAULT_SETTINGS, type AppData, type StorageAdapter } from './storage'

const TABLE = 'user_data'
const BUCKET = 'receipts'

export function createSupabaseStorage(client: SupabaseClient): StorageAdapter {
  async function uid(): Promise<string> {
    const { data, error } = await client.auth.getUser()
    if (error || !data.user) throw new Error('Not signed in')
    return data.user.id
  }

  return {
    async load(): Promise<AppData> {
      const userId = await uid()
      const { data, error } = await client
        .from(TABLE).select('data').eq('user_id', userId).maybeSingle()
      if (error) throw error
      const blob = (data?.data ?? {}) as Partial<AppData>
      return {
        ...emptyAppData(),
        ...blob,
        settings: { ...DEFAULT_SETTINGS, ...(blob.settings ?? {}) },
        learnedMerchants: { ...(blob.learnedMerchants ?? {}) },
      }
    },

    async save(data: AppData): Promise<void> {
      const userId = await uid()
      const { error } = await client.from(TABLE).upsert(
        { user_id: userId, data, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
      if (error) throw error
    },

    async saveReceipt(file: File): Promise<string> {
      const userId = await uid()
      const path = `${userId}/${Date.now()}-${file.name}`
      const { error } = await client.storage.from(BUCKET).upload(path, file)
      if (error) throw error
      return path
    },

    async readReceiptUrl(name: string): Promise<string | null> {
      const { data, error } = await client.storage.from(BUCKET).createSignedUrl(name, 3600)
      if (error) return null
      return data?.signedUrl ?? null
    },
  }
}

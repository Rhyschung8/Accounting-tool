import { describe, it, expect, vi } from 'vitest'
import { createSupabaseStorage } from '../../src/storage/supabaseStorage'
import { emptyAppData } from '../../src/storage/storage'

function mockClient(opts: { row?: any } = {}) {
  const upsert = vi.fn().mockResolvedValue({ error: null })
  const maybeSingle = vi.fn().mockResolvedValue({ data: opts.row ?? null, error: null })
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  const from = vi.fn(() => ({ select, upsert }))
  const upload = vi.fn().mockResolvedValue({ error: null })
  const createSignedUrl = vi.fn().mockResolvedValue({ data: { signedUrl: 'https://signed/x' }, error: null })
  const storageFrom = vi.fn(() => ({ upload, createSignedUrl }))
  const getUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  return {
    client: { from, storage: { from: storageFrom }, auth: { getUser } } as any,
    upsert, upload, createSignedUrl, from, storageFrom,
  }
}

describe('SupabaseStorageAdapter', () => {
  it('load returns emptyAppData when the user has no row yet', async () => {
    const { client } = mockClient({ row: null })
    const a = createSupabaseStorage(client)
    expect(await a.load()).toEqual(emptyAppData())
  })
  it('load merges the stored blob over defaults', async () => {
    const { client } = mockClient({ row: { data: { entries: [{ id: '1' }], settings: { hoursPerWeekAtHome: 30 } } } })
    const a = createSupabaseStorage(client)
    const d = await a.load()
    expect(d.entries).toHaveLength(1)
    expect(d.settings.hoursPerWeekAtHome).toBe(30)
    expect(d.settings.textSize).toBe('large') // default preserved
  })
  it('save upserts the whole blob keyed by user_id', async () => {
    const { client, upsert } = mockClient()
    const a = createSupabaseStorage(client)
    await a.save({ ...emptyAppData(), entries: [{ id: 'x' } as any] })
    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', data: expect.objectContaining({ entries: [{ id: 'x' }] }) }),
      expect.objectContaining({ onConflict: 'user_id' }),
    )
  })
  it('saveReceipt uploads under the user folder and returns the path', async () => {
    const { client, upload } = mockClient()
    const a = createSupabaseStorage(client)
    const path = await a.saveReceipt(new File(['x'], 'r.jpg'))
    expect(path).toMatch(/^user-1\/.*r\.jpg$/)
    expect(upload).toHaveBeenCalledWith(path, expect.any(File))
  })
  it('readReceiptUrl returns a signed url', async () => {
    const { client } = mockClient()
    const a = createSupabaseStorage(client)
    expect(await a.readReceiptUrl('user-1/r.jpg')).toBe('https://signed/x')
  })
})

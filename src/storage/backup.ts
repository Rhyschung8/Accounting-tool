export function shouldBackup(lastBackupIso: string | null, now: Date): boolean {
  if (!lastBackupIso) return true
  const days = (now.getTime() - new Date(lastBackupIso).getTime()) / 86_400_000
  return days >= 7
}

export async function writeBackup(
  dirHandle: FileSystemDirectoryHandle,
  json: string,
  now: Date = new Date(),
): Promise<void> {
  const backups = await dirHandle.getDirectoryHandle('backups', { create: true })
  const name = `data-${now.toISOString().slice(0, 10)}.json`
  const fh = await backups.getFileHandle(name, { create: true })
  const w = await fh.createWritable()
  await w.write(json)
  await w.close()
}

/**
 * R9: Check if a weekly backup is due; if so, write it and return the new ISO timestamp.
 * Returns the existing lastBackupIso unchanged if no backup was needed or an error occurred.
 */
export async function maybeWeeklyBackup(
  dirHandle: FileSystemDirectoryHandle,
  json: string,
  lastBackupIso: string | null | undefined,
  now: Date = new Date(),
): Promise<string> {
  const last = lastBackupIso ?? null
  if (!shouldBackup(last, now)) return last ?? now.toISOString()
  await writeBackup(dirHandle, json, now)
  return now.toISOString()
}

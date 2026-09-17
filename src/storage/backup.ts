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

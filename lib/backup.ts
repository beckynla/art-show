import { createReadStream } from 'fs'
import { mkdir, readdir, stat, unlink } from 'fs/promises'
import os from 'os'
import path from 'path'
import { PassThrough, Readable } from 'stream'
import { createGzip } from 'zlib'
import { prisma } from './db'
import { getUploadsDir } from './storage'

// Automatic database snapshots to keep; older ones are deleted
const KEEP_SNAPSHOTS = 14
const SNAPSHOT_INTERVAL_MS = 24 * 60 * 60 * 1000
const SNAPSHOT_RE = /^snapshot-\d{8}-\d{6}\.db$/

// Snapshots live next to the database (in production /data/backups on the persistent disk).
// A relative SQLite path (local dev, "file:./dev.db") falls back to prisma/backups.
export function getBackupDir(): string {
  if (process.env.BACKUP_DIR) return process.env.BACKUP_DIR
  const url = process.env.DATABASE_URL || ''
  const dbPath = url.startsWith('file:') ? url.slice('file:'.length) : ''
  return path.isAbsolute(dbPath)
    ? path.join(path.dirname(dbPath), 'backups')
    : path.join(process.cwd(), 'prisma', 'backups')
}

function timestamp(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}-` +
    `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`
  )
}

// Consistent copy of the live SQLite database, safe to take while the site is running
async function vacuumInto(target: string): Promise<void> {
  if (!/^[\w/.:\\ -]+$/.test(target)) throw new Error('Unsafe backup path')
  await prisma.$executeRawUnsafe(`VACUUM INTO '${target}'`)
}

export interface Snapshot {
  name: string
  size: number
  createdAt: Date
}

export async function listSnapshots(): Promise<Snapshot[]> {
  const dir = getBackupDir()
  const names = await readdir(dir).catch(() => [] as string[])
  const snapshots = await Promise.all(
    names
      .filter((name) => SNAPSHOT_RE.test(name))
      .map(async (name) => {
        const info = await stat(path.join(dir, name))
        return { name, size: info.size, createdAt: info.mtime }
      })
  )
  return snapshots.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function createSnapshot(): Promise<Snapshot> {
  const dir = getBackupDir()
  await mkdir(dir, { recursive: true })
  const name = `snapshot-${timestamp()}.db`
  await vacuumInto(path.join(dir, name))

  // Keep only the most recent snapshots
  const snapshots = await listSnapshots()
  await Promise.all(
    snapshots.slice(KEEP_SNAPSHOTS).map((old) => unlink(path.join(dir, old.name)).catch(() => {}))
  )

  const info = await stat(path.join(dir, name))
  return { name, size: info.size, createdAt: info.mtime }
}

// Called when the admin area is used: take a snapshot if the newest is over a day old,
// so there is always a copy from before each day's edits. Never throws.
let snapshotInProgress: Promise<unknown> | null = null
export async function ensureDailySnapshot(): Promise<void> {
  if (snapshotInProgress) return
  try {
    const [latest] = await listSnapshots()
    if (latest && Date.now() - latest.createdAt.getTime() < SNAPSHOT_INTERVAL_MS) return
    snapshotInProgress = createSnapshot()
    await snapshotInProgress
  } catch (error) {
    console.error('Automatic backup snapshot failed:', error)
  } finally {
    snapshotInProgress = null
  }
}

export function isSnapshotName(name: string): boolean {
  return SNAPSHOT_RE.test(name)
}

export function snapshotPath(name: string): string {
  return path.join(getBackupDir(), name)
}

// --- Full backup archive (.tar.gz of the database and all uploaded images) ---

// Minimal ustar header; our names are short ASCII so the 100-byte name field suffices
function tarHeader(name: string, size: number, mtime: Date): Buffer {
  const header = Buffer.alloc(512, 0)
  const write = (value: string, offset: number, length: number) =>
    header.write(value.slice(0, length), offset, length, 'ascii')
  const octal = (value: number, length: number) => value.toString(8).padStart(length - 1, '0') + '\0'

  write(name, 0, 100)
  write(octal(0o644, 8), 100, 8)
  write(octal(0, 8), 108, 8)
  write(octal(0, 8), 116, 8)
  write(octal(size, 12), 124, 12)
  write(octal(Math.floor(mtime.getTime() / 1000), 12), 136, 12)
  write('        ', 148, 8) // checksum placeholder (spaces) while summing
  write('0', 156, 1) // regular file
  write('ustar\0', 257, 6)
  write('00', 263, 2)

  let checksum = 0
  for (let i = 0; i < header.length; i++) checksum += header[i]
  write(checksum.toString(8).padStart(6, '0') + '\0 ', 148, 8)
  return header
}

const README = `Gallery backup

database/prod.db  - the site's database (paintings, settings, text, inquiries)
uploads/          - every uploaded image

Keep this file somewhere safe (your computer, iCloud, Google Drive).
To restore, both parts go back onto the server's /data disk:
  database/prod.db -> /data/prod.db
  uploads/*        -> /data/uploads/
`

export async function createFullBackupStream(): Promise<{ stream: Readable; filename: string }> {
  const stamp = timestamp()
  const tempDb = path.join(os.tmpdir(), `backup-${stamp}.db`)
  await vacuumInto(tempDb)

  const uploadsDir = getUploadsDir()
  const uploadNames = (await readdir(uploadsDir).catch(() => [] as string[])).filter(
    (name) => !name.startsWith('.')
  )

  const tar = new PassThrough()
  const gzip = createGzip({ level: 1 }) // images are already compressed; keep it fast
  tar.pipe(gzip)
  tar.on('error', (error) => gzip.destroy(error))

  const addBuffer = (name: string, data: Buffer) => {
    tar.write(tarHeader(name, data.length, new Date()))
    tar.write(data)
    const pad = (512 - (data.length % 512)) % 512
    if (pad) tar.write(Buffer.alloc(pad, 0))
  }

  const addFile = async (name: string, filePath: string) => {
    const info = await stat(filePath)
    if (!info.isFile()) return
    tar.write(tarHeader(name, info.size, info.mtime))
    for await (const chunk of createReadStream(filePath)) {
      if (!tar.write(chunk)) await new Promise((resolve) => tar.once('drain', resolve))
    }
    const pad = (512 - (info.size % 512)) % 512
    if (pad) tar.write(Buffer.alloc(pad, 0))
  }

  // Build the archive in the background while the response streams it out
  ;(async () => {
    try {
      addBuffer('README.txt', Buffer.from(README))
      await addFile('database/prod.db', tempDb)
      for (const name of uploadNames) {
        await addFile(`uploads/${name}`, path.join(uploadsDir, name))
      }
      tar.end(Buffer.alloc(1024, 0)) // end-of-archive marker
    } catch (error) {
      console.error('Full backup failed:', error)
      tar.destroy(error as Error)
    } finally {
      await unlink(tempDb).catch(() => {})
    }
  })()

  return { stream: gzip, filename: `gallery-backup-${stamp}.tar.gz` }
}

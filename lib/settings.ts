import { prisma } from './db'
import { encrypt, decrypt, isEncrypted } from './encryption'

// Keys that should be encrypted in the database
const SENSITIVE_KEYS = [
  'stripe_secret_key',
  'stripe_webhook_secret',
]

// Cache for settings to avoid repeated database calls
const settingsCache = new Map<string, { value: string; timestamp: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute

function shouldEncrypt(key: string): boolean {
  return SENSITIVE_KEYS.includes(key)
}

export async function getSetting(key: string): Promise<string | null> {
  // Check cache first
  const cached = settingsCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value
  }

  const setting = await prisma.setting.findUnique({
    where: { key }
  })

  if (!setting) {
    return null
  }

  let value = setting.value

  // Decrypt if this is a sensitive key and the value is encrypted
  if (shouldEncrypt(key) && isEncrypted(value)) {
    try {
      value = decrypt(value)
    } catch {
      console.error(`Failed to decrypt setting: ${key}`)
      return null
    }
  }

  // Update cache
  settingsCache.set(key, { value, timestamp: Date.now() })

  return value
}

export async function getSettings(group: string): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany({
    where: { group }
  })

  const result: Record<string, string> = {}

  for (const setting of settings) {
    let value = setting.value

    // Decrypt if this is a sensitive key and the value is encrypted
    if (shouldEncrypt(setting.key) && isEncrypted(value)) {
      try {
        value = decrypt(value)
      } catch {
        console.error(`Failed to decrypt setting: ${setting.key}`)
        continue
      }
    }

    result[setting.key] = value
  }

  return result
}

export async function getAllSettings(): Promise<Record<string, string>> {
  const settings = await prisma.setting.findMany()

  const result: Record<string, string> = {}

  for (const setting of settings) {
    let value = setting.value

    // Decrypt if this is a sensitive key and the value is encrypted
    if (shouldEncrypt(setting.key) && isEncrypted(value)) {
      try {
        value = decrypt(value)
      } catch {
        console.error(`Failed to decrypt setting: ${setting.key}`)
        continue
      }
    }

    result[setting.key] = value
  }

  return result
}

export async function setSetting(
  key: string,
  value: string,
  type: string = 'string',
  group: string = 'general'
): Promise<void> {
  let storedValue = value

  // Encrypt sensitive values
  if (shouldEncrypt(key) && value) {
    storedValue = encrypt(value)
  }

  await prisma.setting.upsert({
    where: { key },
    update: { value: storedValue, type, group },
    create: { key, value: storedValue, type, group }
  })

  // Invalidate cache
  settingsCache.delete(key)
}

export async function setSettings(
  settings: Record<string, string>,
  group: string = 'general'
): Promise<void> {
  for (const [key, value] of Object.entries(settings)) {
    await setSetting(key, value, 'string', group)
  }
}

export async function deleteSetting(key: string): Promise<void> {
  await prisma.setting.delete({
    where: { key }
  }).catch(() => {
    // Ignore if setting doesn't exist
  })

  // Invalidate cache
  settingsCache.delete(key)
}

export function clearSettingsCache(): void {
  settingsCache.clear()
}

// Helper to get typed settings
export async function getSettingNumber(key: string): Promise<number | null> {
  const value = await getSetting(key)
  if (value === null) return null
  const num = parseFloat(value)
  return isNaN(num) ? null : num
}

export async function getSettingBoolean(key: string): Promise<boolean> {
  const value = await getSetting(key)
  return value === 'true'
}

export async function getSettingJson<T>(key: string): Promise<T | null> {
  const value = await getSetting(key)
  if (value === null) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

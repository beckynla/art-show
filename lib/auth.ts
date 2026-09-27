import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from './db'
import type { Session, User } from '@/types'

const SESSION_COOKIE_NAME = 'gallery_session'
const SESSION_EXPIRY_DAYS = 7

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set')
  }
  return secret
}

function signSession(data: string): string {
  const secret = getSessionSecret()
  const signature = createHmac('sha256', secret).update(data).digest('hex')
  return `${data}.${signature}`
}

function verifySession(signedData: string): string | null {
  const secret = getSessionSecret()
  const parts = signedData.split('.')
  if (parts.length !== 2) return null

  const [data, signature] = parts
  const expectedSignature = createHmac('sha256', secret).update(data).digest('hex')

  // Use timing-safe comparison to prevent timing attacks
  try {
    const signatureBuffer = Buffer.from(signature, 'hex')
    const expectedBuffer = Buffer.from(expectedSignature, 'hex')

    if (signatureBuffer.length !== expectedBuffer.length) return null
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null

    return data
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(user: User): Promise<void> {
  const sessionData: Session = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS)

  const sessionPayload = JSON.stringify({
    ...sessionData,
    expiresAt: expiresAt.toISOString()
  })

  const signedSession = signSession(Buffer.from(sessionPayload).toString('base64'))

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, signedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  })
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie?.value) {
    return null
  }

  const data = verifySession(sessionCookie.value)
  if (!data) {
    return null
  }

  try {
    const sessionPayload = JSON.parse(Buffer.from(data, 'base64').toString())

    // Check if session has expired
    if (new Date(sessionPayload.expiresAt) < new Date()) {
      return null
    }

    return {
      userId: sessionPayload.userId,
      email: sessionPayload.email,
      role: sessionPayload.role
    }
  } catch {
    return null
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    redirect('/admin/login')
  }
  return session
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth()
  if (session.role !== 'admin') {
    redirect('/admin/login')
  }
  return session
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId }
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  })

  if (!user) {
    return null
  }

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) {
    return null
  }

  const userData: User = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }

  await createSession(userData)

  return userData
}

export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  const hashedPassword = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'admin'
    }
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export async function updatePassword(userId: string, newPassword: string): Promise<void> {
  const hashedPassword = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  })
}

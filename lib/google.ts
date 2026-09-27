import { cookies } from 'next/headers'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`

// Scopes needed for Google Photos read-only access
const SCOPES = [
  'https://www.googleapis.com/auth/photoslibrary.readonly',
]

export function getGoogleAuthUrl(): string {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured')
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
  })

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
}

export async function exchangeCodeForTokens(code: string): Promise<{
  access_token: string
  refresh_token?: string
  expires_in: number
}> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials are not configured')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to exchange code for tokens: ${error}`)
  }

  return response.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
}> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials are not configured')
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to refresh token: ${error}`)
  }

  return response.json()
}

// Store Google tokens in HTTP-only cookies
export async function setGoogleTokens(accessToken: string, refreshToken: string | undefined, expiresIn: number) {
  const cookieStore = await cookies()
  const expiresAt = Date.now() + expiresIn * 1000

  cookieStore.set('google_access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresIn,
    path: '/',
  })

  cookieStore.set('google_token_expires', expiresAt.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: expiresIn,
    path: '/',
  })

  if (refreshToken) {
    // Store refresh token with longer expiry (30 days)
    cookieStore.set('google_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
    })
  }
}

export async function getGoogleAccessToken(): Promise<string | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('google_access_token')?.value
  const expiresAt = cookieStore.get('google_token_expires')?.value
  const refreshToken = cookieStore.get('google_refresh_token')?.value

  if (!accessToken) {
    return null
  }

  // Check if token is expired or about to expire (within 5 minutes)
  if (expiresAt && Date.now() > parseInt(expiresAt) - 5 * 60 * 1000) {
    if (refreshToken) {
      try {
        const tokens = await refreshAccessToken(refreshToken)
        await setGoogleTokens(tokens.access_token, undefined, tokens.expires_in)
        return tokens.access_token
      } catch {
        return null
      }
    }
    return null
  }

  return accessToken
}

export async function clearGoogleTokens() {
  const cookieStore = await cookies()
  cookieStore.delete('google_access_token')
  cookieStore.delete('google_token_expires')
  cookieStore.delete('google_refresh_token')
}

export function isGoogleConfigured(): boolean {
  return !!(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET)
}

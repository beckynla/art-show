import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getGoogleAuthUrl, isGoogleConfigured } from '@/lib/google'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Google is configured
    if (!isGoogleConfigured()) {
      return NextResponse.json(
        { error: 'Google OAuth is not configured. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your environment.' },
        { status: 500 }
      )
    }

    const authUrl = getGoogleAuthUrl()
    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error('Error generating Google auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL' },
      { status: 500 }
    )
  }
}

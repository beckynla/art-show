import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getGoogleAccessToken, isGoogleConfigured, clearGoogleTokens } from '@/lib/google'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configured = isGoogleConfigured()
    if (!configured) {
      return NextResponse.json({ configured: false, connected: false })
    }

    const accessToken = await getGoogleAccessToken()
    return NextResponse.json({
      configured: true,
      connected: !!accessToken,
    })
  } catch (error) {
    console.error('Error checking Google Photos status:', error)
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    )
  }
}

// Disconnect from Google Photos
export async function DELETE() {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await clearGoogleTokens()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Google Photos:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect' },
      { status: 500 }
    )
  }
}

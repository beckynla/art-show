import { NextResponse } from 'next/server'
import { exchangeCodeForTokens, setGoogleTokens } from '@/lib/google'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')

    if (error) {
      // User denied access or other error
      return NextResponse.redirect(
        new URL('/admin/settings?google_error=' + encodeURIComponent(error), process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/admin/settings?google_error=no_code', process.env.NEXT_PUBLIC_APP_URL!)
      )
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code)

    // Store tokens in cookies
    await setGoogleTokens(tokens.access_token, tokens.refresh_token, tokens.expires_in)

    // Redirect back to admin with success
    return NextResponse.redirect(
      new URL('/admin/settings?google_connected=true', process.env.NEXT_PUBLIC_APP_URL!)
    )
  } catch (error) {
    console.error('Error in Google OAuth callback:', error)
    return NextResponse.redirect(
      new URL('/admin/settings?google_error=token_exchange_failed', process.env.NEXT_PUBLIC_APP_URL!)
    )
  }
}

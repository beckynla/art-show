import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getGoogleAccessToken, isGoogleConfigured } from '@/lib/google'

export const dynamic = 'force-dynamic'

interface GooglePhoto {
  id: string
  baseUrl: string
  mimeType: string
  filename: string
  mediaMetadata?: {
    width: string
    height: string
    creationTime: string
  }
}

interface GooglePhotosResponse {
  mediaItems?: GooglePhoto[]
  nextPageToken?: string
}

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if Google is configured
    if (!isGoogleConfigured()) {
      return NextResponse.json(
        { error: 'Google OAuth is not configured', configured: false },
        { status: 400 }
      )
    }

    // Get access token
    const accessToken = await getGoogleAccessToken()
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not connected to Google Photos', connected: false },
        { status: 401 }
      )
    }

    // Get pagination token from query
    const url = new URL(request.url)
    const pageToken = url.searchParams.get('pageToken')
    const pageSize = url.searchParams.get('pageSize') || '50'

    // Fetch photos from Google Photos API
    const apiUrl = new URL('https://photoslibrary.googleapis.com/v1/mediaItems')
    apiUrl.searchParams.set('pageSize', pageSize)
    if (pageToken) {
      apiUrl.searchParams.set('pageToken', pageToken)
    }

    const response = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Google Photos access expired', connected: false },
          { status: 401 }
        )
      }
      const error = await response.text()
      console.error('Google Photos API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch photos from Google' },
        { status: 500 }
      )
    }

    const data: GooglePhotosResponse = await response.json()

    // Transform the response to include full-size image URLs
    // Adding =w2048-h2048 to baseUrl gets a reasonable size image
    const photos = (data.mediaItems || [])
      .filter(item => item.mimeType?.startsWith('image/'))
      .map(item => ({
        id: item.id,
        url: `${item.baseUrl}=w2048-h2048`,
        thumbnail: `${item.baseUrl}=w200-h200-c`,
        filename: item.filename,
        width: item.mediaMetadata?.width,
        height: item.mediaMetadata?.height,
      }))

    return NextResponse.json({
      photos,
      nextPageToken: data.nextPageToken,
      connected: true,
    })
  } catch (error) {
    console.error('Error fetching Google Photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch photos' },
      { status: 500 }
    )
  }
}

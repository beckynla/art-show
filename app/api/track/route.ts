import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { prisma } from '@/lib/db'

const SESSION_COOKIE_NAME = 'gallery_session'
const BOT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|preview|headless|lighthouse|monitor/i

function getDevice(userAgent: string): string {
  if (/iPad|Tablet/i.test(userAgent)) return 'tablet'
  if (/Mobi|Android|iPhone/i.test(userAgent)) return 'mobile'
  return 'desktop'
}

// Anonymous visitor id: the same person gets the same id for one day only,
// so visits can be counted without cookies or storing IP addresses
function getVisitorId(request: Request, userAgent: string): string {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || ''
  const day = new Date().toISOString().slice(0, 10)
  return createHash('sha256')
    .update(`${process.env.SESSION_SECRET || ''}|${day}|${ip}|${userAgent}`)
    .digest('hex')
    .slice(0, 16)
}

// Outside site's hostname, without "www." / "l." / "m." prefixes; null for direct visits
function cleanReferrer(referrer: unknown, ownHost: string | null): string | null {
  if (typeof referrer !== 'string' || !referrer) return null
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^(www|l|lm|m)\./, '')
    const own = (ownHost || '').toLowerCase().split(':')[0].replace(/^www\./, '')
    return host && host !== own ? host.slice(0, 100) : null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent') || ''

    // Don't count search-engine bots or the site owner while logged in
    const isAdmin = request.headers.get('cookie')?.includes(`${SESSION_COOKIE_NAME}=`)
    if (BOT_PATTERN.test(userAgent) || isAdmin) {
      return new NextResponse(null, { status: 204 })
    }

    const body = await request.json().catch(() => ({}))
    const path = typeof body.path === 'string' ? body.path : ''
    if (!path.startsWith('/') || path.length > 300 || /^\/(admin|api|setup)/.test(path)) {
      return new NextResponse(null, { status: 204 })
    }

    await prisma.pageView.create({
      data: {
        path,
        referrer: cleanReferrer(body.referrer, request.headers.get('host')),
        device: getDevice(userAgent),
        visitorId: getVisitorId(request, userAgent),
      },
    })
  } catch (error) {
    console.error('Error recording page view:', error)
  }

  return new NextResponse(null, { status: 204 })
}

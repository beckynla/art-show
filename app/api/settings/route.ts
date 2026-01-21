import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSetting, setSetting, getSettings, getAllSettings, setSettings } from '@/lib/settings'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const group = searchParams.get('group')
    const key = searchParams.get('key')

    if (key) {
      const value = await getSetting(key)
      return NextResponse.json({ [key]: value })
    }

    if (group) {
      const settings = await getSettings(group)
      return NextResponse.json(settings)
    }

    const allSettings = await getAllSettings()
    return NextResponse.json(allSettings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { settings, group } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Settings object is required' },
        { status: 400 }
      )
    }

    await setSettings(settings, group || 'general')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving settings:', error)
    return NextResponse.json(
      { error: 'Failed to save settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value, type, group } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      )
    }

    await setSetting(key, value ?? '', type || 'string', group || 'general')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving setting:', error)
    return NextResponse.json(
      { error: 'Failed to save setting' },
      { status: 500 }
    )
  }
}

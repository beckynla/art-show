import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { createUser, createSession } from '@/lib/auth'
import { setSetting } from '@/lib/settings'

export async function POST(request: Request) {
  try {
    // Check if setup is already complete
    const setupComplete = await prisma.setting.findUnique({
      where: { key: 'setup_complete' }
    })

    if (setupComplete?.value === 'true') {
      return NextResponse.json(
        { error: 'Setup has already been completed' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      email,
      password,
      name,
      shopName,
      shopTagline,
      primaryColor,
      accentColor,
      contactEmail,
    } = body

    // Validate required fields
    if (!email || !password || !shopName) {
      return NextResponse.json(
        { error: 'Email, password, and shop name are required' },
        { status: 400 }
      )
    }

    // Create admin user
    const user = await createUser(email, password, name)

    // Create session for the new user
    await createSession(user)

    // Save settings
    await Promise.all([
      setSetting('shop_name', shopName, 'string', 'general'),
      setSetting('shop_tagline', shopTagline || '', 'string', 'general'),
      setSetting('primary_color', primaryColor || '#0ea5e9', 'string', 'appearance'),
      setSetting('accent_color', accentColor || '#d946ef', 'string', 'appearance'),
      setSetting('contact_email', contactEmail || email, 'string', 'contact'),
      setSetting('currency', 'USD', 'string', 'general'),
      setSetting('setup_complete', 'true', 'boolean', 'system'),
    ])

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (error) {
    console.error('Setup error:', error)

    // Check for duplicate email
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Setup failed. Please try again.' },
      { status: 500 }
    )
  }
}

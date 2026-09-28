import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { createSnapshot } from '@/lib/backup'

// Admin: take a database snapshot now
export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const snapshot = await createSnapshot()
    return NextResponse.json({ snapshot }, { status: 201 })
  } catch (error) {
    console.error('Error creating snapshot:', error)
    return NextResponse.json({ error: 'Failed to create snapshot' }, { status: 500 })
  }
}

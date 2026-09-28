import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { buildInquiryEmail, getNotificationEmail, isEmailConfigured, sendEmail } from '@/lib/email'

// Admin: send a sample inquiry alert to check that email notifications work
export async function POST() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: 'Email sending is not set up yet: add RESEND_API_KEY to the server settings.' },
      { status: 400 }
    )
  }

  const to = await getNotificationEmail()
  if (!to) {
    return NextResponse.json(
      { error: 'Add a notification email (or a contact email) and save first.' },
      { status: 400 }
    )
  }

  const email = buildInquiryEmail({
    name: 'Test Visitor',
    email: to,
    message: 'This is a test of your inquiry notifications. If you can read this, they are working!',
    productTitle: null,
    productSlug: null,
  })
  const result = await sendEmail({ to, ...email, subject: `[Test] ${email.subject}` })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 })
  }
  return NextResponse.json({ success: true, to })
}

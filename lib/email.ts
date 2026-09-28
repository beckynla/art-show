import { getSettings } from './settings'

// Sends email through Resend's HTTP API (https://resend.com).
// Requires RESEND_API_KEY. EMAIL_FROM defaults to Resend's shared test sender,
// which can only deliver to the email address the Resend account was created with.
const DEFAULT_FROM = 'Gallery <onboarding@resend.dev>'

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
}

export type SendEmailResult = { ok: true } | { ok: false; error: string }

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

export async function sendEmail({ to, subject, html, text, replyTo }: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'Email is not set up (RESEND_API_KEY is missing)' }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || DEFAULT_FROM,
        to: [to],
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return { ok: false, error: body.message || `Email service returned ${response.status}` }
    }
    return { ok: true }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Failed to reach email service' }
  }
}

// Address that receives inquiry alerts: the dedicated setting, else the public contact email
export async function getNotificationEmail(): Promise<string | null> {
  const contact = await getSettings('contact')
  return contact.inquiry_notify_email?.trim() || contact.contact_email?.trim() || null
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function siteUrl(path: string): string {
  return `${(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')}${path}`
}

interface InquiryEmailData {
  name: string
  email: string
  message: string
  productTitle: string | null
  productSlug: string | null
}

export function buildInquiryEmail(inquiry: InquiryEmailData) {
  const piece = inquiry.productTitle || 'your gallery'
  const productUrl = inquiry.productSlug ? siteUrl(`/product/${inquiry.productSlug}`) : null
  const adminUrl = siteUrl('/admin/inquiries')

  const subject = `New inquiry about ${piece} from ${inquiry.name}`

  const text = [
    `New inquiry from ${inquiry.name} <${inquiry.email}>`,
    inquiry.productTitle ? `Painting: ${inquiry.productTitle}${productUrl ? ` (${productUrl})` : ''}` : null,
    '',
    inquiry.message,
    '',
    `Reply to this email to answer ${inquiry.name} directly.`,
    `All inquiries: ${adminUrl}`,
  ]
    .filter((line) => line !== null)
    .join('\n')

  const messageHtml = escapeHtml(inquiry.message).replace(/\n/g, '<br>')
  const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; color: #111827;">
  <h2 style="font-size: 18px; margin: 0 0 16px;">New inquiry${inquiry.productTitle ? ` about <em>${escapeHtml(inquiry.productTitle)}</em>` : ''}</h2>
  <p style="margin: 0 0 4px;"><strong>From:</strong> ${escapeHtml(inquiry.name)}</p>
  <p style="margin: 0 0 16px;"><strong>Email:</strong> <a href="mailto:${escapeHtml(inquiry.email)}">${escapeHtml(inquiry.email)}</a></p>
  <div style="padding: 16px; background: #f9fafb; border-left: 3px solid #d1d5db; margin: 0 0 16px; line-height: 1.5;">${messageHtml}</div>
  <p style="margin: 0 0 16px; color: #4b5563;">Reply to this email to answer ${escapeHtml(inquiry.name)} directly.</p>
  <p style="margin: 0; font-size: 14px;">
    ${productUrl ? `<a href="${escapeHtml(productUrl)}">View the painting</a> &nbsp;·&nbsp; ` : ''}<a href="${escapeHtml(adminUrl)}">All inquiries</a>
  </p>
</div>`

  return { subject, text, html }
}

'use client'

import { Input } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default function PaymentSettingsPage() {
  return (
    <SettingsForm
      group="payments"
      title="Payment Settings"
      description="Configure Stripe payment processing"
    >
      {({ settings, updateSetting }) => (
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900">Stripe Integration</h4>
            <p className="text-sm text-blue-700 mt-1">
              To accept payments, you&apos;ll need a Stripe account. Get your API keys from the{' '}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Stripe Dashboard
              </a>
              .
            </p>
          </div>

          <Input
            label="Publishable Key"
            value={settings.stripe_publishable_key || ''}
            onChange={(e) => updateSetting('stripe_publishable_key', e.target.value)}
            placeholder="pk_live_..."
            helpText="Your Stripe publishable key (starts with pk_)"
          />

          <Input
            label="Secret Key"
            type="password"
            value={settings.stripe_secret_key || ''}
            onChange={(e) => updateSetting('stripe_secret_key', e.target.value)}
            placeholder="sk_live_..."
            helpText="Your Stripe secret key (starts with sk_). This will be encrypted."
          />

          <Input
            label="Webhook Secret"
            type="password"
            value={settings.stripe_webhook_secret || ''}
            onChange={(e) => updateSetting('stripe_webhook_secret', e.target.value)}
            placeholder="whsec_..."
            helpText="Your Stripe webhook signing secret (starts with whsec_). This will be encrypted."
          />

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">Webhook Setup</h4>
            <p className="text-sm text-gray-600 mt-1">
              Configure your Stripe webhook endpoint to:{' '}
              <code className="bg-gray-200 px-1 rounded">
                {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhooks/stripe
              </code>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Required events: <code className="bg-gray-200 px-1 rounded">checkout.session.completed</code>
            </p>
          </div>
        </div>
      )}
    </SettingsForm>
  )
}

'use client'

import { Input, Textarea } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default function ContactSettingsPage() {
  return (
    <SettingsForm
      group="contact"
      title="Contact Settings"
      description="Contact information and social links"
    >
      {({ settings, updateSetting }) => (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>

          <Input
            label="Contact Email"
            type="email"
            value={settings.contact_email || ''}
            onChange={(e) => updateSetting('contact_email', e.target.value)}
            placeholder="hello@example.com"
          />
          <Input
            label="Phone Number"
            value={settings.contact_phone || ''}
            onChange={(e) => updateSetting('contact_phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
          <Textarea
            label="Address"
            value={settings.contact_address || ''}
            onChange={(e) => updateSetting('contact_address', e.target.value)}
            placeholder="123 Art Street&#10;New York, NY 10001"
            rows={3}
          />

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Social Links</h3>

          <Input
            label="Instagram"
            value={settings.social_instagram || ''}
            onChange={(e) => updateSetting('social_instagram', e.target.value)}
            placeholder="https://instagram.com/yourusername"
          />
          <Input
            label="Facebook"
            value={settings.social_facebook || ''}
            onChange={(e) => updateSetting('social_facebook', e.target.value)}
            placeholder="https://facebook.com/yourpage"
          />
          <Input
            label="Twitter / X"
            value={settings.social_twitter || ''}
            onChange={(e) => updateSetting('social_twitter', e.target.value)}
            placeholder="https://twitter.com/yourusername"
          />
          <Input
            label="Pinterest"
            value={settings.social_pinterest || ''}
            onChange={(e) => updateSetting('social_pinterest', e.target.value)}
            placeholder="https://pinterest.com/yourusername"
          />
          <Input
            label="LinkedIn"
            value={settings.social_linkedin || ''}
            onChange={(e) => updateSetting('social_linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/yourusername"
          />
        </div>
      )}
    </SettingsForm>
  )
}

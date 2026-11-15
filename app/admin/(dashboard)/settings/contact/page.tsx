'use client'

import { Input, Textarea, Select } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { SettingsImageInput } from '@/components/admin/SettingsImageInput'
import { TestEmailButton } from '@/components/admin/TestEmailButton'

const CONTACT_PHOTO_KEYS = ['contact_photo_1', 'contact_photo_2', 'contact_photo_3']

export default function ContactSettingsPage() {
  return (
    <SettingsForm
      group="contact"
      title="Contact Settings"
      description="Contact information and social links"
    >
      {({ settings, updateSetting, hasChanges }) => (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Page Text</h3>

          <Input
            label="Page Heading"
            value={settings.contact_heading || ''}
            onChange={(e) => updateSetting('contact_heading', e.target.value)}
            placeholder="Contact"
            helpText="Leave empty to show no heading"
          />
          <Textarea
            label="Intro Text"
            value={settings.contact_intro || ''}
            onChange={(e) => updateSetting('contact_intro', e.target.value)}
            placeholder="A warm welcome — mention your location, that you welcome in-person conversations, and offer studio tours by appointment..."
            rows={6}
            helpText="Shown at the top of the contact page. Good place to note your location and invite studio visits."
          />

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Contact Page Photos</h3>
          <p className="text-sm text-gray-500 -mt-3">
            Optional. Add up to three photos, such as your studio or you at work. They appear below the intro text.
          </p>
          <Select
            label="Photo Size"
            value={settings.contact_photo_size || 'small'}
            onChange={(e) => updateSetting('contact_photo_size', e.target.value)}
            helpText="How large the photos appear on the contact page. Visitors can click any photo to see it full screen."
            options={[
              { value: 'small', label: 'Small' },
              { value: 'medium', label: 'Medium' },
              { value: 'large', label: 'Large' },
            ]}
          />
          {CONTACT_PHOTO_KEYS.map((key, i) => (
            <SettingsImageInput
              key={key}
              label={`Contact Photo ${i + 1}`}
              value={settings[key] || ''}
              onChange={(url) => updateSetting(key, url)}
            />
          ))}

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Contact Information</h3>

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

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Inquiry Notifications</h3>
          <p className="text-sm text-gray-500 -mt-3">
            Get an email whenever someone sends an inquiry. Replying to the email answers the visitor directly.
          </p>
          <Input
            label="Send inquiry alerts to"
            type="email"
            value={settings.inquiry_notify_email || ''}
            onChange={(e) => updateSetting('inquiry_notify_email', e.target.value)}
            placeholder={settings.contact_email || 'you@example.com'}
            helpText="Leave empty to use your contact email above"
          />
          <TestEmailButton disabled={hasChanges} />

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

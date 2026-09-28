'use client'

import { Textarea } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default function LegalSettingsPage() {
  return (
    <SettingsForm
      group="legal"
      title="Legal Pages"
      description="Privacy policy and terms of service"
    >
      {({ settings, updateSetting }) => (
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> These pages are important for legal compliance. Consider consulting
              with a legal professional when drafting your policies.
            </p>
          </div>

          <Textarea
            label="Privacy Policy"
            value={settings.privacy_policy || ''}
            onChange={(e) => updateSetting('privacy_policy', e.target.value)}
            placeholder="Enter your privacy policy here..."
            rows={10}
            helpText="Displayed on the /privacy page"
          />

          <Textarea
            label="Terms of Service"
            value={settings.terms_of_service || ''}
            onChange={(e) => updateSetting('terms_of_service', e.target.value)}
            placeholder="Enter your terms of service here..."
            rows={10}
            helpText="Displayed on the /terms page"
          />
        </div>
      )}
    </SettingsForm>
  )
}

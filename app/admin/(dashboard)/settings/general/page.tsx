'use client'

import { Input, Select } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'

const currencyOptions = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
]

export default function GeneralSettingsPage() {
  return (
    <SettingsForm
      group="general"
      title="General Settings"
      description="Basic information about your shop"
    >
      {({ settings, updateSetting }) => (
        <div className="space-y-6">
          <Input
            label="Shop Name"
            value={settings.shop_name || ''}
            onChange={(e) => updateSetting('shop_name', e.target.value)}
            placeholder="My Art Gallery"
          />
          <Input
            label="Tagline"
            value={settings.shop_tagline || ''}
            onChange={(e) => updateSetting('shop_tagline', e.target.value)}
            placeholder="Original artwork by..."
          />
          <Input
            label="Logo URL"
            value={settings.shop_logo || ''}
            onChange={(e) => updateSetting('shop_logo', e.target.value)}
            placeholder="/uploads/logo.png"
            helpText="Upload your logo in the product image uploader, then paste the URL here"
          />
          <Select
            label="Currency"
            value={settings.currency || 'USD'}
            onChange={(e) => updateSetting('currency', e.target.value)}
            options={currencyOptions}
          />
        </div>
      )}
    </SettingsForm>
  )
}

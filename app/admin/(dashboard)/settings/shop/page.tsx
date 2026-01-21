'use client'

import { Input, Textarea } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { SettingsImageInput } from '@/components/admin/SettingsImageInput'

export default function ShopSettingsPage() {
  return (
    <SettingsForm
      group="shop"
      title="Shop Settings"
      description="Customize your shop page appearance"
    >
      {({ settings, updateSetting }) => (
        <div className="space-y-6">
          <Input
            label="Page Title"
            value={settings.shop_title || ''}
            onChange={(e) => updateSetting('shop_title', e.target.value)}
            placeholder="Shop"
          />
          <Textarea
            label="Page Description"
            value={settings.shop_description || ''}
            onChange={(e) => updateSetting('shop_description', e.target.value)}
            placeholder="Browse our collection of original artwork"
            rows={2}
          />
          <SettingsImageInput
            label="Shop Banner Image (optional)"
            value={settings.shop_banner || ''}
            onChange={(url) => updateSetting('shop_banner', url)}
          />
          <Input
            label="Empty State Message"
            value={settings.shop_empty_message || ''}
            onChange={(e) => updateSetting('shop_empty_message', e.target.value)}
            placeholder="No products found"
            helpText="Shown when there are no products to display"
          />
        </div>
      )}
    </SettingsForm>
  )
}

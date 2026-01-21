'use client'

import { Input, Textarea } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default function ShippingSettingsPage() {
  return (
    <SettingsForm
      group="shipping"
      title="Shipping Settings"
      description="Configure shipping rates and policies"
    >
      {({ settings, updateSetting }) => (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Flat Rate Shipping</h3>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="shipping_enabled"
              checked={settings.shipping_enabled === 'true'}
              onChange={(e) => updateSetting('shipping_enabled', e.target.checked ? 'true' : 'false')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="shipping_enabled" className="text-sm font-medium text-gray-700">
              Enable shipping charges
            </label>
          </div>

          <Input
            label="Flat Rate (USD)"
            type="number"
            step="0.01"
            min="0"
            value={settings.shipping_flat_rate || ''}
            onChange={(e) => updateSetting('shipping_flat_rate', e.target.value)}
            placeholder="10.00"
            helpText="Standard shipping rate applied to all orders"
          />

          <Input
            label="Free Shipping Threshold (USD)"
            type="number"
            step="0.01"
            min="0"
            value={settings.shipping_free_threshold || ''}
            onChange={(e) => updateSetting('shipping_free_threshold', e.target.value)}
            placeholder="100.00"
            helpText="Orders above this amount get free shipping (leave empty to disable)"
          />

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Shipping Information</h3>

          <Textarea
            label="Processing Time"
            value={settings.shipping_processing_time || ''}
            onChange={(e) => updateSetting('shipping_processing_time', e.target.value)}
            placeholder="Orders are typically processed within 1-2 business days."
            rows={2}
          />

          <Textarea
            label="Delivery Estimates"
            value={settings.shipping_delivery_time || ''}
            onChange={(e) => updateSetting('shipping_delivery_time', e.target.value)}
            placeholder="Standard shipping: 5-7 business days&#10;Express shipping: 2-3 business days"
            rows={3}
          />

          <Textarea
            label="International Shipping Note"
            value={settings.shipping_international || ''}
            onChange={(e) => updateSetting('shipping_international', e.target.value)}
            placeholder="International shipping available. Contact us for a quote."
            rows={2}
          />
        </div>
      )}
    </SettingsForm>
  )
}

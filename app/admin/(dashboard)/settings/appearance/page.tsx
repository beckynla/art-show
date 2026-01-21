'use client'

import { Input, Select } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'

const fontOptions = [
  { value: 'system-ui', label: 'System Default' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Lora', label: 'Lora' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Roboto', label: 'Roboto' },
]

export default function AppearanceSettingsPage() {
  return (
    <SettingsForm
      group="appearance"
      title="Appearance Settings"
      description="Customize colors and fonts"
    >
      {({ settings, updateSetting }) => (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Colors</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primary_color || '#0ea5e9'}
                  onChange={(e) => updateSetting('primary_color', e.target.value)}
                  className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={settings.primary_color || '#0ea5e9'}
                  onChange={(e) => updateSetting('primary_color', e.target.value)}
                  placeholder="#0ea5e9"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Accent Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.accent_color || '#d946ef'}
                  onChange={(e) => updateSetting('accent_color', e.target.value)}
                  className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
                />
                <Input
                  value={settings.accent_color || '#d946ef'}
                  onChange={(e) => updateSetting('accent_color', e.target.value)}
                  placeholder="#d946ef"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            These colors will be used throughout your shop for buttons, links, and accents.
          </p>

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Fonts</h3>

          <Select
            label="Body Font"
            value={settings.body_font || 'system-ui'}
            onChange={(e) => updateSetting('body_font', e.target.value)}
            options={fontOptions}
            helpText="Font used for general text content"
          />
          <Select
            label="Heading Font"
            value={settings.heading_font || 'system-ui'}
            onChange={(e) => updateSetting('heading_font', e.target.value)}
            options={fontOptions}
            helpText="Font used for headings and titles"
          />
        </div>
      )}
    </SettingsForm>
  )
}

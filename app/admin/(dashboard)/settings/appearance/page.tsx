'use client'

import { Input, Select } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { SettingsImageInput } from '@/components/admin/SettingsImageInput'

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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <div className="flex gap-2 max-w-xs">
              <input
                type="color"
                value={settings.background_color || '#ffffff'}
                onChange={(e) => updateSetting('background_color', e.target.value)}
                className="h-10 w-14 rounded border border-gray-300 cursor-pointer"
              />
              <Input
                value={settings.background_color || '#ffffff'}
                onChange={(e) => updateSetting('background_color', e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            Primary and accent colors are used for buttons, links, and accents. The background color
            fills the page behind your artwork. Light backgrounds keep text easiest to read.
          </p>

          <h3 className="text-lg font-medium text-gray-900 border-b pb-2 pt-4">Background Image</h3>

          <SettingsImageInput
            label="Background Image"
            value={settings.background_image || ''}
            onChange={(url) => updateSetting('background_image', url)}
            helpText="Shown behind every page of your site. Leave empty for a plain background color."
          />

          {settings.background_image && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Style"
                value={settings.background_image_style || 'cover'}
                onChange={(e) => updateSetting('background_image_style', e.target.value)}
                helpText="Fill suits photos; Tile suits textures like paper or canvas"
                options={[
                  { value: 'cover', label: 'Fill screen' },
                  { value: 'tile', label: 'Tile (repeat pattern)' },
                ]}
              />
              <Select
                label="Strength"
                value={settings.background_image_strength || '20'}
                onChange={(e) => updateSetting('background_image_strength', e.target.value)}
                helpText="Softer blends into your background color so text stays readable"
                options={[
                  { value: '10', label: 'Very soft' },
                  { value: '20', label: 'Soft' },
                  { value: '35', label: 'Medium' },
                  { value: '60', label: 'Strong' },
                  { value: '100', label: 'Full (may make text hard to read)' },
                ]}
              />
              <label className="col-span-2 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.background_parallax !== 'false'}
                  onChange={(e) => updateSetting('background_parallax', e.target.checked ? 'true' : 'false')}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">Parallax scrolling</span>
                  <span className="block text-sm text-gray-500">
                    The background drifts slowly as visitors scroll, adding a sense of depth
                  </span>
                </span>
              </label>
            </div>
          )}

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

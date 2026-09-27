'use client'

import { Input, Textarea, Select } from '@/components/ui'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { SettingsImageInput } from '@/components/admin/SettingsImageInput'
import { FeaturedItemsEditor, FeaturedItem } from '@/components/admin/FeaturedItemsEditor'

function ToggleSwitch({
  label,
  description,
  checked,
  onChange
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between py-3">
      <div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  )
}

function parseFeaturedItems(json: string): FeaturedItem[] {
  try {
    const parsed = JSON.parse(json)
    if (Array.isArray(parsed)) return parsed
    return []
  } catch {
    return []
  }
}

export default function HomepageSettingsPage() {
  return (
    <SettingsForm
      group="homepage"
      title="Homepage Settings"
      description="Customize your homepage layout and content"
    >
      {({ settings, updateSetting }) => (
        <div className="space-y-8">
          {/* Section Visibility */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Section Visibility</h3>
            <p className="text-sm text-gray-500 mb-4">Choose which sections to display on your homepage</p>

            <div className="bg-gray-50 rounded-lg p-4 space-y-1 divide-y divide-gray-200">
              <ToggleSwitch
                label="Show Hero Section"
                description="Large banner at the top with image and call-to-action"
                checked={settings.show_hero !== 'false'}
                onChange={(checked) => updateSetting('show_hero', checked ? 'true' : 'false')}
              />
              <ToggleSwitch
                label="Show Featured Section"
                description="Showcase your best work with custom images and text"
                checked={settings.show_featured !== 'false'}
                onChange={(checked) => updateSetting('show_featured', checked ? 'true' : 'false')}
              />
              <ToggleSwitch
                label="Show Greeting Section"
                description="A welcome message on the homepage"
                checked={settings.show_greeting !== 'false'}
                onChange={(checked) => updateSetting('show_greeting', checked ? 'true' : 'false')}
              />
            </div>
          </div>

          {/* Hero Section */}
          {settings.show_hero !== 'false' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Hero Section</h3>

              <div className="space-y-4">
                <SettingsImageInput
                  label="Hero Background Image"
                  value={settings.hero_image || ''}
                  onChange={(url) => updateSetting('hero_image', url)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Hero Height"
                    value={settings.hero_height || 'standard'}
                    onChange={(e) => updateSetting('hero_height', e.target.value)}
                    helpText="How tall the banner is"
                    options={[
                      { value: 'short', label: 'Short' },
                      { value: 'standard', label: 'Standard' },
                      { value: 'tall', label: 'Tall' },
                      { value: 'full', label: 'Full (very tall)' },
                    ]}
                  />
                  <Select
                    label="Image Position"
                    value={settings.hero_position || 'center'}
                    onChange={(e) => updateSetting('hero_position', e.target.value)}
                    helpText="Which part of the photo to show"
                    options={[
                      { value: 'center', label: 'Center' },
                      { value: 'top', label: 'Top' },
                      { value: 'bottom', label: 'Bottom' },
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                      { value: 'left top', label: 'Top Left' },
                      { value: 'right top', label: 'Top Right' },
                      { value: 'left bottom', label: 'Bottom Left' },
                      { value: 'right bottom', label: 'Bottom Right' },
                    ]}
                  />
                </div>
                <Input
                  label="Hero Title"
                  value={settings.hero_title || ''}
                  onChange={(e) => updateSetting('hero_title', e.target.value)}
                  placeholder="Welcome to My Gallery"
                />
                <Textarea
                  label="Hero Subtitle"
                  value={settings.hero_subtitle || ''}
                  onChange={(e) => updateSetting('hero_subtitle', e.target.value)}
                  placeholder="Discover unique artwork..."
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Featured Section */}
          {settings.show_featured !== 'false' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Featured Section</h3>

              <div className="space-y-4">
                <Input
                  label="Section Title"
                  value={settings.featured_title || ''}
                  onChange={(e) => updateSetting('featured_title', e.target.value)}
                  placeholder="Featured Work"
                />
                <Textarea
                  label="Section Description"
                  value={settings.featured_description || ''}
                  onChange={(e) => updateSetting('featured_description', e.target.value)}
                  placeholder="Check out some of my favorite pieces..."
                  rows={2}
                />

                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Featured Items</label>
                  <FeaturedItemsEditor
                    items={parseFeaturedItems(settings.featured_items || '[]')}
                    onChange={(items) => updateSetting('featured_items', JSON.stringify(items))}
                    maxItems={8}
                  />
                </div>
              </div>
            </div>
          )}

          {/* About Section */}
          {/* Greeting Section — homepage welcome */}
          {settings.show_greeting !== 'false' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Greeting Section</h3>
              <p className="text-sm text-gray-500 mb-4">
                A short welcome shown on the homepage. This is separate from your About page.
              </p>

              <div className="space-y-4">
                <SettingsImageInput
                  label="Greeting Photo"
                  value={settings.greeting_image || ''}
                  onChange={(url) => updateSetting('greeting_image', url)}
                />
                <Input
                  label="Greeting Title"
                  value={settings.greeting_title || ''}
                  onChange={(e) => updateSetting('greeting_title', e.target.value)}
                  placeholder="Welcome"
                />
                <Textarea
                  label="Greeting Message"
                  value={settings.greeting_content || ''}
                  onChange={(e) => updateSetting('greeting_content', e.target.value)}
                  placeholder="A warm welcome to visitors — who you are and what they'll find here..."
                  rows={5}
                />
              </div>
            </div>
          )}

          {/* About Page — content for the /about page (not the homepage) */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">About Page</h3>
            <p className="text-sm text-gray-500 mb-4">
              Content for your dedicated <span className="font-medium">/about</span> page.
            </p>

            <div className="space-y-4">
              <SettingsImageInput
                label="Photo"
                value={settings.about_image || ''}
                onChange={(url) => updateSetting('about_image', url)}
              />
              <Input
                label="Page Title"
                value={settings.about_title || ''}
                onChange={(e) => updateSetting('about_title', e.target.value)}
                placeholder="About the Artist"
              />
              <Textarea
                label="About Content"
                value={settings.about_content || ''}
                onChange={(e) => updateSetting('about_content', e.target.value)}
                placeholder="Tell visitors about yourself, your artistic journey, and your inspiration..."
                rows={6}
              />
            </div>
          </div>
        </div>
      )}
    </SettingsForm>
  )
}

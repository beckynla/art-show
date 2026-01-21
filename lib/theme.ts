import { getAllSettings } from './settings'

// Color utility functions
function hexToHSL(hex: string): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null

  let r = parseInt(result[1], 16) / 255
  let g = parseInt(result[2], 16) / 255
  let b = parseInt(result[3], 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

function generateColorScale(baseColor: string): Record<string, string> {
  const hsl = hexToHSL(baseColor)
  if (!hsl) {
    // Return default if invalid color
    return {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49',
    }
  }

  const { h, s } = hsl

  return {
    50: `hsl(${h}, ${Math.min(s + 30, 100)}%, 97%)`,
    100: `hsl(${h}, ${Math.min(s + 25, 100)}%, 94%)`,
    200: `hsl(${h}, ${Math.min(s + 20, 100)}%, 86%)`,
    300: `hsl(${h}, ${Math.min(s + 15, 100)}%, 74%)`,
    400: `hsl(${h}, ${Math.min(s + 10, 100)}%, 60%)`,
    500: `hsl(${h}, ${s}%, 50%)`,
    600: `hsl(${h}, ${s}%, 42%)`,
    700: `hsl(${h}, ${s}%, 35%)`,
    800: `hsl(${h}, ${s}%, 28%)`,
    900: `hsl(${h}, ${s}%, 22%)`,
    950: `hsl(${h}, ${s}%, 14%)`,
  }
}

export async function generateThemeCSS(): Promise<string> {
  const settings = await getAllSettings()

  const primaryColor = settings.primary_color || '#0ea5e9'
  const accentColor = settings.accent_color || '#d946ef'
  const bodyFont = settings.body_font || 'system-ui'
  const headingFont = settings.heading_font || 'system-ui'

  const primaryScale = generateColorScale(primaryColor)
  const accentScale = generateColorScale(accentColor)

  return `
    :root {
      --color-primary-50: ${primaryScale[50]};
      --color-primary-100: ${primaryScale[100]};
      --color-primary-200: ${primaryScale[200]};
      --color-primary-300: ${primaryScale[300]};
      --color-primary-400: ${primaryScale[400]};
      --color-primary-500: ${primaryScale[500]};
      --color-primary-600: ${primaryScale[600]};
      --color-primary-700: ${primaryScale[700]};
      --color-primary-800: ${primaryScale[800]};
      --color-primary-900: ${primaryScale[900]};
      --color-primary-950: ${primaryScale[950]};

      --color-accent-50: ${accentScale[50]};
      --color-accent-100: ${accentScale[100]};
      --color-accent-200: ${accentScale[200]};
      --color-accent-300: ${accentScale[300]};
      --color-accent-400: ${accentScale[400]};
      --color-accent-500: ${accentScale[500]};
      --color-accent-600: ${accentScale[600]};
      --color-accent-700: ${accentScale[700]};
      --color-accent-800: ${accentScale[800]};
      --color-accent-900: ${accentScale[900]};
      --color-accent-950: ${accentScale[950]};

      --font-sans: ${bodyFont}, system-ui, sans-serif;
      --font-heading: ${headingFont}, system-ui, sans-serif;
    }
  `
}

export async function getThemeSettings() {
  const settings = await getAllSettings()

  return {
    shopName: settings.shop_name || 'ArtBox',
    shopTagline: settings.shop_tagline || '',
    shopLogo: settings.shop_logo || null,
    currency: settings.currency || 'USD',
    primaryColor: settings.primary_color || '#0ea5e9',
    accentColor: settings.accent_color || '#d946ef',
    bodyFont: settings.body_font || 'system-ui',
    headingFont: settings.heading_font || 'system-ui',
  }
}

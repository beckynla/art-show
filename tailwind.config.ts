import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50, #f0f9ff)',
          100: 'var(--color-primary-100, #e0f2fe)',
          200: 'var(--color-primary-200, #bae6fd)',
          300: 'var(--color-primary-300, #7dd3fc)',
          400: 'var(--color-primary-400, #38bdf8)',
          500: 'var(--color-primary-500, #0ea5e9)',
          600: 'var(--color-primary-600, #0284c7)',
          700: 'var(--color-primary-700, #0369a1)',
          800: 'var(--color-primary-800, #075985)',
          900: 'var(--color-primary-900, #0c4a6e)',
          950: 'var(--color-primary-950, #082f49)',
        },
        accent: {
          50: 'var(--color-accent-50, #fdf4ff)',
          100: 'var(--color-accent-100, #fae8ff)',
          200: 'var(--color-accent-200, #f5d0fe)',
          300: 'var(--color-accent-300, #f0abfc)',
          400: 'var(--color-accent-400, #e879f9)',
          500: 'var(--color-accent-500, #d946ef)',
          600: 'var(--color-accent-600, #c026d3)',
          700: 'var(--color-accent-700, #a21caf)',
          800: 'var(--color-accent-800, #86198f)',
          900: 'var(--color-accent-900, #701a75)',
          950: 'var(--color-accent-950, #4a044e)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        gayatri: {
          50: '#f3f6f3',
          100: '#e1ebe0',
          300: '#b0ceae',
          500: '#8ba889',
          600: '#4a654a',
          700: '#243d25'
        },
        cream: {
          DEFAULT: '#fbf9f8',
          100: '#f5f3f3',
          200: '#efeded'
        },
        peach: {
          100: '#f7dac9',
          500: '#f2d5c4'
        },
        charcoal: {
          DEFAULT: '#1b1c1c',
          soft: '#4a4a4a'
        },
        outline: {
          DEFAULT: '#737971',
          soft: '#c3c8bf'
        }
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-literata)', 'ui-serif', 'Georgia']
      },
      boxShadow: {
        glow: '0 12px 40px -8px rgba(74, 101, 74, 0.08)',
        'glow-md': '0 16px 48px -8px rgba(74, 101, 74, 0.12)'
      }
    }
  },
  plugins: []
} satisfies Config

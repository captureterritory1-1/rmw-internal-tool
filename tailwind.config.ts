import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#2F4F4F',
          'green-light': '#E8F0F0',
          'green-dark': '#1A3333',
        },
        marble: {
          bg: '#F9F7F4',
          border: '#E5E0D8',
        },
      },
    },
  },
  plugins: [],
} satisfies Config


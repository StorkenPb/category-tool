/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      borderStyle: {
        'dashed-spaced': 'dashed',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.border-dashed-spaced': {
          'border-style': 'dashed',
          'border-width': '1px 0 0 1px',
          'border-image': 'repeating-linear-gradient(to bottom, currentColor 0, currentColor 3px, transparent 3px, transparent 8px) 1',
        },
      })
    },
  ],
} 
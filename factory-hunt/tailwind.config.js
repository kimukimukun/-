/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        factory: {
          blue: '#1E40AF',
          'blue-light': '#3B82F6',
          'blue-dark': '#1E3A8A',
          gray: '#374151',
          'gray-light': '#F3F4F6',
        },
      },
    },
  },
  plugins: [],
}

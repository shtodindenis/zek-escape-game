/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zone-gray': '#374151',
        'zone-dark': '#1F2937',
        'zone-light': '#F3F4F6',
        'zone-border': '#4B5563',
        'zone-blue': '#3B82F6',
        'zone-blue-dark': '#2563EB',
      }
    },
  },
  plugins: [],
}
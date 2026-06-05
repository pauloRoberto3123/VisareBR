/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1A1A1A', // Dark background / main text color
        'secondary': '#FFFFFF', // White background / light text color
        'accent-gold': '#D4AF37', // A tasteful gold
        'whatsapp-green': '#25D366', // Standard WhatsApp green
        'light-gray': '#F8F8F8', // For subtle backgrounds
        'dark-gray': '#333333', // For secondary text / borders
      }
    },
  },
  plugins: [],
}

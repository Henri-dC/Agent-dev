/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./a-propos.html",
    "./approche.html",
    "./contact.html",
    "./services.html",
    "./js/script.js",
    // Si les fichiers Vue sont pertinents, décommenter ci-dessous
    // "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#4A6E82',
        'light-blue': '#9EC0D4',
        'calm-blue': '#7A9EAE',
        'calm-blue-dark': '#6A8EAE',
        'light-bg': '#EBF2F7',
        'body-bg': '#f8f8f8',
        'text-dark': '#333',
        'text-medium': '#555',
        'text-light': '#666',
        // Ajoutez d'autres couleurs si nécessaire
      },
      fontFamily: {
        sans: ['Open Sans', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
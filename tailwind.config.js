/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.vue",
    "./src/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        'primary-header': '#E0F2F7',
        'primary-text': '#2C4A5A',
        'secondary-accent': '#7FCEDC',
        'button-bg': '#5DBECF',
        'button-hover-bg': '#48A0B0',
        'body-bg': '#FDFEFF',
        'section-bg': '#F0F8FA',
        'card-border': '#ADDCE6',
        'text-dark': '#3A3A3A',
        'text-medium': '#6A6A6A',
        'text-light': '#9ABBDD'
      },
      fontFamily: {
        sans: ['Open Sans', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}
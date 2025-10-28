/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./a-propos.html",
    "./approche.html",
    "./contact.html",
    "./services.html",
    "./connexion-patient.html",
    "./prendre-rdv.html",
    "./js/script.js"
    // Si les fichiers Vue sont pertinents, décommenter ci-dessous
    // "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-header': '#E0F2F7', // Bleu très clair, aérien
        'primary-text': '#2C4A5A',   // Bleu foncé doux pour les titres et le logo
        'secondary-accent': '#7FCEDC', // Bleu aqua frais pour les accents (hover liens, focus formulaires)
        'button-bg': '#5DBECF',    // Bleu apaisant pour les boutons
        'button-hover-bg': '#48A0B0', // Nuance plus foncée au survol
        'body-bg': '#FDFEFF',        // Fond presque blanc pour le corps
        'section-bg': '#F0F8FA',     // Fond de section clair
        'card-border': '#ADDCE6',    // Bordure de carte plus claire
        'text-dark': '#3A3A3A',      // Texte principal foncé
        'text-medium': '#6A6A6A',    // Texte secondaire
        'text-light': '#9ABBDD',     // Texte léger, pour les liens secondaires ou infos
      },
      fontFamily: {
        sans: ['Open Sans', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

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
        'primary-header': '#FFFFFF', // Plus clair pour contraster avec les nouveaux fonds
        'primary-text': '#1A202C',   // Très sombre pour haute lisibilité
        'secondary-accent': '#38B2AC', // Un teal plus vibrant
        'button-bg': '#3182CE',      // Un bleu plus fort pour les boutons
        'button-hover-bg': '#2C5282', // Un bleu plus foncé pour le survol des boutons
        'body-bg': '#F9FAFB',        // Gris très clair, presque blanc
        'section-bg': '#EBF4F7',     // Un bleu-gris clair distinct pour les sections
        'card-border': '#CBD5E0',    // Gris clair pour les bordures de cartes
        'text-dark': '#2D3748',      // Gris foncé pour les titres
        'text-medium': '#4A5568',    // Gris moyen pour le texte courant
        'text-light': '#718096'      // Gris plus clair pour les détails
      },
      fontFamily: {
        sans: ['Open Sans', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
}
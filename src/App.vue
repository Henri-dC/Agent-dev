<script setup>
import { ref } from 'vue';

const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <header class="main-header">
    <nav class="main-nav">
      <button class="hamburger-button" @click="toggleMenu" :class="{ 'is-active': isMenuOpen }" aria-label="Toggle navigation">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>
      <ul :class="{ 'menu-open': isMenuOpen }">
        <li><router-link to="/" @click="isMenuOpen = false">Accueil</router-link></li>
        <li><router-link to="/chaussures" @click="isMenuOpen = false">Chaussures</router-link></li>
        <li><router-link to="/vetements" @click="isMenuOpen = false">Vêtements</router-link></li>
      </ul>
    </nav>
  </header>

  <router-view />
</template>

<style>
/* Styles globaux pour le body */
body {
  background-color: #e0e0e0; /* Gris clair */
  margin: 0;
  min-height: 100vh; /* Assure que le fond couvre toute la hauteur de la fenêtre */
  overflow-x: hidden; /* Empêche le défilement horizontal */
}
</style>

<style scoped>
.main-header {
  background-color: #333;
  padding: 10px 20px; /* Padding pour le header lui-même */
  position: relative; /* Nécessaire pour positionner le menu déroulant */
  z-index: 1000; /* Assure que le header est au-dessus du contenu */
  display: flex; /* Utilise flexbox pour centrer le nav ou aligner des éléments */
  justify-content: space-between; /* Place le menu et le bouton aux extrémités */
  align-items: center;
}

.main-nav {
  width: 100%; /* Le nav prend toute la largeur du header */
  display: flex;
  justify-content: flex-end; /* Aligne les éléments à droite par défaut (desktop)
  align-items: center;
}

.main-nav ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex; /* Par défaut, les liens sont horizontaux sur desktop */
  justify-content: center;
  align-items: center;
}

.main-nav li a {
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease;
  display: block; /* Rend toute la zone cliquable */
}

.main-nav li a:hover,
.main-nav li a.router-link-exact-active {
  background-color: #575757;
  border-radius: 5px;
}

/* Styles pour le bouton hamburger */
.hamburger-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001; /* Au-dessus du menu */
  width: 30px;
  height: 24px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end; /* Aligne les barres à droite si elles ne sont pas pleine largeur */
  display: none; /* Caché par défaut, sera affiché sur mobile via media query */
}

.hamburger-button .bar {
  display: block;
  width: 100%; /* Les barres prennent toute la largeur du bouton */
  height: 3px;
  background-color: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Animation du bouton hamburger */
.hamburger-button.is-active .bar:nth-child(1) {
  transform: translateY(10.5px) rotate(45deg);
}
.hamburger-button.is-active .bar:nth-child(2) {
  opacity: 0;
}
.hamburger-button.is-active .bar:nth-child(3) {
  transform: translateY(-10.5px) rotate(-45deg);
}

/* Responsive design */
@media (max-width: 768px) {
  .main-nav {
    justify-content: flex-end; /* Aligne le bouton hamburger à droite */
  }

  .hamburger-button {
    display: flex; /* Visible sur mobile */
  }

  .main-nav ul {
    display: flex; /* Toujours flex pour transition max-height */
    flex-direction: column;
    width: 100%;
    position: absolute;
    top: 100%; /* Sous le header */
    left: 0;
    background-color: #333;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    max-height: 0; /* Caché par défaut */
    transition: max-height 0.3s ease-out;
  }

  .main-nav ul.menu-open {
    max-height: 300px; /* Affiche le menu (hauteur suffisante pour tous les liens) */
  }

  .main-nav ul li {
    width: 100%;
    text-align: center;
  }

  .main-nav ul li a {
    padding: 15px; /* Plus d'espace sur mobile */
    border-bottom: 1px solid #575757; /* Séparateur */
  }

  .main-nav ul li:last-child a {
    border-bottom: none;
  }
}

@media (min-width: 769px) {
  .main-nav {
    justify-content: center; /* Centre le contenu du nav sur desktop */
  }

  .main-nav .hamburger-button {
    display: none; /* Caché sur desktop */
  }

  .main-nav ul {
    /* Assure que le menu est toujours visible et horizontal sur desktop */
    display: flex;
    position: static; /* Supprime le positionnement absolu */
    max-height: none; /* Supprime la limite de hauteur */
    background-color: transparent;
    box-shadow: none;
    flex-direction: row; /* Reviens à l'alignement horizontal */
    justify-content: center; /* Centre les liens sur desktop */
    width: auto; /* Permet aux liens de prendre leur largeur naturelle */
  }
}
</style>

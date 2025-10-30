<script setup>
// La logique isMenuOpen et toggleMenu a été supprimée car le menu hamburger n'est plus utilisé.
</script>

<template>
  <!-- En-tête utilisant les classes Tailwind -->
  <header class="bg-primary-text text-white py-4 shadow-md relative z-50">
    <nav class="container mx-auto px-4 flex justify-between items-center">
      <!-- Nom de la marque/Logo -->
      <router-link to="/" class="text-2xl font-bold text-white hover:text-secondary-accent transition-colors duration-300">
        AIWordPlace
      </router-link>

      <!-- Menu de navigation - Toujours visible, style bureau -->
      <ul class="flex space-x-6">
        <li>
          <router-link to="/"
                       class="block py-2 px-4 text-white text-lg font-semibold
                              hover:text-secondary-accent transition-colors duration-300">
            Accueil
          </router-link>
        </li>
        <li>
          <router-link to="/chaussures"
                       class="block py-2 px-4 text-white text-lg font-semibold
                              hover:text-secondary-accent transition-colors duration-300">
            Chaussures
          </router-link>
        </li>
        <!-- Lien vers la page de liste des produits, simplifiée -->
        <li>
          <router-link to="/products"
                       class="block py-2 px-4 text-white text-lg font-semibold
                              hover:text-secondary-accent transition-colors duration-300">
            Produits
          </router-link>
        </li>
      </ul>
    </nav>
  </header>

  <router-view />
</template>

<style>
/* Styles globaux pour le corps - utilisant les couleurs Tailwind */
body {
  @apply bg-body-bg m-0 min-h-screen overflow-x-hidden;
}

/* Styles de base pour l'état actif des liens de routeur - pour le rendre cohérent avec le survol */
.router-link-exact-active {
    @apply text-secondary-accent; /* Utilise la couleur secondaire pour les liens actifs sur ordinateur */
}
/* Les styles d'animation du bouton hamburger ont été supprimés car le bouton lui-même est retiré. */
</style>

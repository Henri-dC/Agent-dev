<script setup>
import AppFooter from '@/components/AppFooter.vue';
import { useCartStore } from '@/stores/cart'; // Import du store panier
import { computed } from 'vue';

const cartStore = useCartStore();
const cartItemCount = computed(() => cartStore.itemCount);
</script>

<template>
  <!-- En-tête global -->
  <header class="w-full bg-body-bg bg-opacity-90 py-4 shadow-md sticky top-0 z-50">
    <div class="container mx-auto flex justify-between items-center px-6">
      <router-link to="/" class="text-2xl font-bold text-primary-text hover:text-secondary-accent transition-colors duration-300">
        AIWordPlace
      </router-link>
      <nav>
        <ul class="flex space-x-6 items-center">
          <li><router-link to="/" class="text-primary-text hover:text-secondary-accent transition-colors duration-300">Accueil</router-link></li>
          <li><router-link to="/chaussures" class="text-primary-text hover:text-secondary-accent transition-colors duration-300">Chaussures</router-link></li>
          <li><router-link to="/products" class="text-primary-text hover:text-secondary-accent transition-colors duration-300">Produits</router-link></li>
          <!-- Lien vers le panier avec compteur -->
          <li>
            <router-link to="/cart" class="relative text-primary-text hover:text-secondary-accent transition-colors duration-300">
              Panier
              <span v-if="cartItemCount > 0" class="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartItemCount }}
              </span>
            </router-link>
          </li>
          <!-- Lien vers l'action "Commencer" sur la page d'accueil -->
          <li><router-link to="/#cta" class="px-5 py-2 rounded-full bg-button-bg text-white hover:bg-button-hover-bg transition-colors duration-300 shadow-lg">Commencer</router-link></li>
        </ul>
      </nav>
    </div>
  </header>

  <div class="relative z-10 min-h-screen flex flex-col items-center">
    <router-view />
  </div>

  <!-- Pied de page global -->
  <AppFooter />
</template>

<style>
body {
  @apply bg-body-bg m-0 min-h-screen overflow-x-hidden;
}

.router-link-exact-active {
    @apply text-secondary-accent; /* Utilise la couleur secondaire pour les liens actifs sur ordinateur */
}

/* Ajoute le style pour les liens d'ancrage internes */
.router-link-active:not(.router-link-exact-active) {
  @apply text-primary-text;
}
</style>

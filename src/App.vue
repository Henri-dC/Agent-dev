<script setup>
import AppFooter from '@/components/AppFooter.vue';
import BackgroundAnimation from '@/components/BackgroundAnimation.vue';
import { useCartStore } from '@/stores/cart';
import { computed, ref, watch } from 'vue'; // Import ref and watch
import { useRoute } from 'vue-router'; // Import useRoute to close menu on navigation

const cartStore = useCartStore();
const cartItemCount = computed(() => cartStore.itemCount);

const showMobileMenu = ref(false); // State for mobile menu visibility
const route = useRoute(); // Get current route

// Close mobile menu when a navigation link is clicked or route changes
const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

// Watch route changes to automatically close mobile menu
watch(() => route.path, () => {
  showMobileMenu.value = false;
});

</script>

<template>
  <!-- Background animation goes first, fixed and lowest z-index -->
  <BackgroundAnimation />

  <!-- En-tête global -->
  <header class="w-full bg-body-bg bg-opacity-90 py-4 shadow-md sticky top-0 z-50">
    <div class="container mx-auto flex justify-between items-center px-6 relative">
      <router-link to="/" class="text-2xl font-bold text-primary-text hover:text-secondary-accent transition-colors duration-300 z-50">
        AIWordPlace
      </router-link>

      <!-- Hamburger Icon for mobile -->
      <button @click="showMobileMenu = !showMobileMenu" class="lg:hidden p-2 rounded-md text-primary-text focus:outline-none focus:ring-2 focus:ring-secondary-accent z-50">
        <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <!-- Navigation Menu (Desktop and Mobile) -->
      <nav :class="{ 'max-h-screen': showMobileMenu, 'max-h-0': !showMobileMenu, 'overflow-hidden': !showMobileMenu }"
           class="lg:max-h-full lg:overflow-visible
                  absolute lg:relative top-full left-0 w-full lg:w-auto
                  bg-body-bg lg:bg-transparent shadow-md lg:shadow-none py-0 lg:py-0
                  z-40 lg:z-auto transition-all duration-300 ease-out lg:flex lg:items-center lg:space-x-6 flex-grow">
        <ul class="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-6 items-center w-full py-4 lg:py-0 lg:justify-end">
          <li><router-link @click="closeMobileMenu" to="/" class="text-primary-text hover:text-secondary-accent transition-colors duration-300 py-2 block w-full text-center lg:inline-block lg:py-0 lg:text-left">Accueil</router-link></li>
          <li><router-link @click="closeMobileMenu" to="/chaussures" class="text-primary-text hover:text-secondary-accent transition-colors duration-300 py-2 block w-full text-center lg:inline-block lg:py-0 lg:text-left">Chaussures</router-link></li>
          <li><router-link @click="closeMobileMenu" to="/products" class="text-primary-text hover:text-secondary-accent transition-colors duration-300 py-2 block w-full text-center lg:inline-block lg:py-0 lg:text-left">Produits</router-link></li>
          <!-- CRM Stock Link -->
          <li><router-link @click="closeMobileMenu" to="/crm/stock" class="text-primary-text hover:text-secondary-accent transition-colors duration-300 py-2 block w-full text-center lg:inline-block lg:py-0 lg:text-left">Gestion Stock CRM</router-link></li>
          <!-- Lien vers le panier avec compteur -->
          <li>
            <router-link @click="closeMobileMenu" to="/cart" class="relative text-primary-text hover:text-secondary-accent transition-colors duration-300 py-2 block w-full text-center lg:inline-block lg:py-0 lg:text-left">
              Panier
              <span v-if="cartItemCount > 0" class="absolute lg:static -top-2 -right-4 lg:ml-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartItemCount }}
              </span>
            </router-link>
          </li>
          <!-- Lien vers l'action "Commencer" sur la page d'accueil -->
          <li><router-link @click="closeMobileMenu" to="/#cta" class="px-5 py-2 rounded-full bg-button-bg text-white hover:bg-button-hover-bg transition-colors duration-300 shadow-lg block w-auto mx-auto lg:inline-block lg:mx-0">Commencer</router-link></li>
        </ul>
      </nav>
    </div>
  </header>

  <div class="relative z-10 min-h-screen flex flex-col items-center"> <!-- Removed bg-body-bg bg-opacity-90 from here -->
    <router-view />
  </div>

  <!-- Pied de page global -->
  <AppFooter />
</template>

<style>
body {
  @apply m-0 min-h-screen overflow-x-hidden; /* Removed bg-body-bg from here */
}

.router-link-exact-active {
    @apply text-secondary-accent; /* Utilise la couleur secondaire pour les liens actifs sur ordinateur */
}

/* Ajoute le style pour les liens d'ancrage internes */
.router-link-active:not(.router-link-exact-active) {
  @apply text-primary-text;
}
</style>

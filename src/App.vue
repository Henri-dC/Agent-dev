<script setup>
import { ref } from 'vue';

const isMenuOpen = ref(false);
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <!-- Header using Tailwind classes -->
  <header class="bg-primary-text text-white py-4 shadow-md relative z-50">
    <nav class="container mx-auto px-4 flex justify-between items-center">
      <!-- Brand/Logo (placeholder, can be customized) -->
      <router-link to="/" class="text-2xl font-bold text-white hover:text-secondary-accent transition-colors duration-300">
        AIWordPlace
      </router-link>

      <!-- Hamburger button for mobile -->
      <button class="lg:hidden flex flex-col justify-around w-8 h-6 bg-transparent border-none cursor-pointer p-0 focus:outline-none"
              @click="toggleMenu"
              :class="{ 'is-active': isMenuOpen }"
              aria-label="Toggle navigation"
              :aria-expanded="isMenuOpen ? 'true' : 'false'">
        <span class="block w-full h-0.5 bg-white rounded-sm transition-all duration-300 ease-in-out origin-top-left"
              :class="{ 'rotate-45 translate-x-1': isMenuOpen }"></span>
        <span class="block w-full h-0.5 bg-white rounded-sm transition-all duration-300 ease-in-out"
              :class="{ 'opacity-0': isMenuOpen }"></span>
        <span class="block w-full h-0.5 bg-white rounded-sm transition-all duration-300 ease-in-out origin-bottom-left"
              :class="{ '-rotate-45 translate-x-1': isMenuOpen }"></span>
      </button>

      <!-- Navigation Menu -->
      <ul class="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-6
                 absolute lg:static top-full left-0 w-full lg:w-auto
                 bg-primary-text lg:bg-transparent shadow-lg lg:shadow-none py-4 lg:py-0
                 transition-all duration-300 ease-in-out overflow-hidden"
          :class="{ 'max-h-0 opacity-0 lg:max-h-full lg:opacity-100': !isMenuOpen,
                    'max-h-screen opacity-100': isMenuOpen }">
        <li>
          <router-link to="/" @click="isMenuOpen = false"
                       class="block py-2 px-4 text-white text-lg font-semibold
                              hover:bg-secondary-accent lg:hover:bg-transparent lg:hover:text-secondary-accent
                              transition-colors duration-300 rounded-md lg:rounded-none">
            Accueil
          </router-link>
        </li>
        <li>
          <router-link to="/chaussures" @click="isMenuOpen = false"
                       class="block py-2 px-4 text-white text-lg font-semibold
                              hover:bg-secondary-accent lg:hover:bg-transparent lg:hover:text-secondary-accent
                              transition-colors duration-300 rounded-md lg:rounded-none">
            Chaussures
          </router-link>
        </li>
        <!-- ADDED: Products link -->
        <li>
          <router-link to="/products" @click="isMenuOpen = false"
                       class="block py-2 px-4 text-white text-lg font-semibold
                              hover:bg-secondary-accent lg:hover:bg-transparent lg:hover:text-secondary-accent
                              transition-colors duration-300 rounded-md lg:rounded-none">
            Produits
          </router-link>
        </li>
      </ul>
    </nav>
  </header>

  <router-view />
</template>

<style>
/* Global styles for the body - using Tailwind colors */
body {
  @apply bg-body-bg m-0 min-h-screen overflow-x-hidden;
}

/* Base styles for router-link active state - make it consistent with hover */
.router-link-exact-active {
    @apply text-secondary-accent; /* Use secondary-accent for active links on desktop */
}
/* For mobile menu, active link might have different bg */
@media (max-width: 1023px) { /* Adjust breakpoint if 'lg' is different */
    .router-link-exact-active {
        @apply bg-secondary-accent text-white; /* Active link has secondary-accent background on mobile */
    }
}

/* Animation for hamburger button remains here as it's specific to the button state */
.hamburger-button.is-active span:nth-child(1) {
  transform: translateY(10.5px) rotate(45deg);
}
.hamburger-button.is-active span:nth-child(2) {
  opacity: 0;
}
.hamburger-button.is-active span:nth-child(3) {
  transform: translateY(-10.5px) rotate(-45deg);
}
</style>
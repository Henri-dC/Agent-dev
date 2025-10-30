<template>
  <div class="container mx-auto px-4 py-8 bg-body-bg min-h-screen">
    <h1 class="text-4xl font-bold text-primary-text mb-8 text-center">Votre Panier</h1>

    <div v-if="cartStore.itemCount === 0" class="text-center text-lg text-text-medium">
      Votre panier est vide.
      <router-link to="/products" class="text-secondary-accent hover:underline ml-2">Commencez vos achats !</router-link>
    </div>

    <div v-else class="bg-white rounded-lg shadow-lg overflow-hidden border border-card-border p-6 md:p-8">
      <div class="space-y-6">
        <div v-for="item in cartStore.items" :key="item.id" class="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
          <img :src="item.imageUrl" :alt="item.name" class="w-20 h-20 object-cover rounded-md flex-shrink-0">
          <div class="flex-grow">
            <h2 class="text-xl font-semibold text-text-dark">{{ item.name }}</h2>
            <p class="text-lg text-primary-text mt-1">{{ item.price }} €</p>
          </div>
          <div class="flex items-center space-x-2">
            <button @click="cartStore.updateQuantity(item.id, item.quantity - 1)"
                    class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200">-</button>
            <input type="number" v-model.number="item.quantity"
                   @change="cartStore.updateQuantity(item.id, $event.target.value)"
                   class="w-16 p-1 border border-gray-300 rounded-md text-center text-text-dark">
            <button @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                    class="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200">+</button>
            <button @click="cartStore.removeItem(item.id)"
                    class="ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200">Supprimer</button>
          </div>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
        <h3 class="text-2xl font-bold text-primary-text">Total du panier:</h3>
        <p class="text-2xl font-bold text-primary-text">{{ cartStore.total }} €</p>
      </div>

      <div class="mt-8 text-right">
        <button @click="proceedToCheckout"
                class="px-8 py-3 bg-button-bg text-white font-semibold rounded-full hover:bg-button-hover-bg transition-colors duration-300 shadow-md">
          Passer la commande
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '@/stores/cart';
import { useRouter } from 'vue-router';

const cartStore = useCartStore();
const router = useRouter();

const proceedToCheckout = () => {
  // Ici, vous implémenteriez la logique de passage à la caisse.
  // Pour l'instant, on se contente d'un message et de vider le panier.
  alert(`Vous allez passer commande pour un total de ${cartStore.total} €.\n(Fonctionnalité de paiement non implémentée pour l'instant)`);
  cartStore.clearCart();
  router.push('/products'); // Redirige après la "commande"
};
</script>

<style scoped>
/* Aucun style spécifique nécessaire car Tailwind CSS est utilisé */
</style>

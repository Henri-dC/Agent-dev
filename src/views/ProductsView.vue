<script setup>
import { ref, onMounted } from 'vue';
import { useCartStore } from '@/stores/cart'; // Import du store panier

const products = ref([]);
const loading = ref(true);
const error = ref(null);
const cartStore = useCartStore(); // Utilisation du store panier

onMounted(async () => {
  try {
    const response = await fetch('http://localhost:3000/api/products'); // Call Node.js backend
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    products.value = data;
  } catch (e) {
    console.error("Error fetching products:", e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

const addToCart = (product) => {
  cartStore.addItem({
    id: product.id,
    name: product.name,
    price: product.price,
    imageUrl: product.images && product.images.length > 0 ? product.images[0].src : 'https://via.placeholder.com/150?text=No+Image'
  });
  alert(`${product.name} ajouté au panier !`);
};
</script>

<template>
  <div class="container mx-auto px-4 py-8 bg-body-bg min-h-screen">
    <h1 class="text-4xl font-bold text-primary-text mb-8 text-center">Nos Produits</h1>

    <div v-if="loading" class="text-center text-lg text-text-medium">Chargement des produits...</div>
    <div v-else-if="error" class="text-center text-lg text-red-500">Erreur: {{ error }}</div>
    <div v-else-if="products.length === 0" class="text-center text-lg text-text-medium">Aucun produit trouvé.</div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div v-for="product in products" :key="product.id"
           class="bg-white rounded-lg shadow-lg overflow-hidden border border-card-border
                  transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
        <img :src="product.images && product.images.length > 0 ? product.images[0].src : 'https://via.placeholder.com/400x300?text=No+Image'" :alt="product.name" class="w-full h-48 object-cover">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-text-dark mb-2">{{ product.name }}</h2>
          <p class="text-primary-text text-2xl font-bold mb-4">{{ product.price }} €</p>
          <p class="text-text-medium text-sm mb-4" v-html="product.short_description || product.description"></p>
          <button @click="addToCart(product)" class="w-full py-2 px-4 rounded-md bg-button-bg text-white font-medium
                         hover:bg-button-hover-bg transition-colors duration-300">
            Ajouter au panier
          </button>
          <router-link :to="{ name: 'product-detail', params: { id: product.id } }"
                       class="mt-2 w-full py-2 px-4 rounded-md bg-secondary-accent text-white font-medium
                              hover:bg-button-hover-bg transition-colors duration-300 block text-center">
            Voir Détails
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* No scoped styles needed, all handled by Tailwind CSS */
</style>

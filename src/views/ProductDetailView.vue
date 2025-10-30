<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const product = ref(null);
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  const productId = route.params.id;
  if (!productId) {
    error.value = "ID du produit manquant dans l'URL.";
    loading.value = false;
    return;
  }

  try {
    // L'endpoint backend_dev/server.js pour /api/products/:id est configuré
    // pour appeler l'API WooCommerce. Sans une configuration WooCommerce active
    // ou un mock backend pour un produit unique, cet appel peut échouer.
    // Pour cet exercice, nous supposons que le backend renverra les données.
    const response = await fetch(`http://localhost:3000/api/products/${productId}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Produit avec l'ID ${productId} non trouvé.`);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    product.value = data;
  } catch (e) {
    console.error("Erreur lors de la récupération du produit:", e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container mx-auto px-4 py-8 bg-body-bg min-h-screen">
    <button @click="$router.back()" class="mb-6 px-4 py-2 bg-button-bg text-white rounded-md hover:bg-button-hover-bg transition-colors duration-300">
        &larr; Retour aux produits
    </button>
    <h1 class="text-4xl font-bold text-primary-text mb-8 text-center" v-if="!loading && !error">
        Détails du produit
    </h1>

    <div v-if="loading" class="text-center text-lg text-text-medium">Chargement du produit...</div>
    <div v-else-if="error" class="text-center text-lg text-red-500">Erreur: {{ error }}</div>
    <div v-else-if="product">
      <div class="flex flex-col lg:flex-row gap-8 bg-white rounded-lg shadow-lg overflow-hidden border border-card-border p-6 md:p-8">
        <!-- Image Section -->
        <div class="lg:w-1/2">
          <img :src="product.imageUrl || 'https://via.placeholder.com/600x400?text=Image+Produit'"
               :alt="product.name"
               class="w-full h-80 object-cover rounded-lg shadow-md">
        </div>

        <!-- Product Details Section -->
        <div class="lg:w-1/2 flex flex-col justify-between">
          <div>
            <h2 class="text-3xl font-bold text-text-dark mb-4">{{ product.name }}</h2>
            <p class="text-2xl font-bold text-primary-text mb-6">{{ product.price }}</p>
            <div class="text-text-medium leading-relaxed mb-6" v-html="product.description || 'Pas de description disponible.'"></div>
          </div>

          <!-- Add to Cart / Quantity Selector - Placeholder -->
          <div class="mt-auto">
            <div class="flex items-center space-x-4 mb-6">
              <label for="quantity" class="text-text-dark font-semibold">Quantité:</label>
              <input type="number" id="quantity" value="1" min="1" class="w-20 p-2 border border-gray-300 rounded-md text-center">
            </div>
            <button class="w-full py-3 px-6 rounded-md bg-button-bg text-white font-semibold
                           hover:bg-button-hover-bg transition-colors duration-300 shadow-md">
              Ajouter au panier
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-lg text-text-medium">Le produit demandé n'existe pas ou n'a pas pu être chargé.</div>
  </div>
</template>

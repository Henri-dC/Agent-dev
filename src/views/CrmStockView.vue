<script setup>
import { onMounted, ref, watch } from 'vue';
import { useCrmStockStore } from '@/stores/crmStock';

const crmStockStore = useCrmStockStore();
const searchTerm = ref('');
const filteredProducts = ref([]);

const filterProducts = () => {
  if (!searchTerm.value) {
    filteredProducts.value = crmStockStore.products;
  } else {
    filteredProducts.value = crmStockStore.products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      String(product.id).includes(searchTerm.value)
    );
  }
};

// Watch for changes in the store's products or the search term
watch(() => crmStockStore.products, filterProducts, { deep: true });
watch(searchTerm, filterProducts);

onMounted(async () => {
  await crmStockStore.fetchProducts();
  filterProducts(); // Initial filter
});

const adjustStock = (product, adjustment) => {
  let newStock = product.stock_quantity + adjustment;
  if (newStock < 0) newStock = 0; // Prevent negative stock
  
  // Optimistically update the product's stock_quantity directly in the component's filteredProducts
  // This will reflect in the v-model input field immediately
  const productInFilteredList = filteredProducts.value.find(p => p.id === product.id);
  if (productInFilteredList) {
    productInFilteredList.stock_quantity = newStock;
  }
  crmStockStore.updateProductStock(product.id, newStock);
};

const updateStockOnBlur = (product) => {
  // v-model.number already parsed it to number or NaN
  let newStock = product.stock_quantity;
  if (isNaN(newStock) || newStock < 0) {
    newStock = 0; // Default to 0 if invalid or negative
    product.stock_quantity = newStock; // Update local model immediately to reflect 0 in the input
  }
  crmStockStore.updateProductStock(product.id, newStock);
};

const handleManageStockChange = (product) => {
  crmStockStore.toggleManageStock(product.id, !product.manage_stock);
};
</script>

<template>
  <div class="container mx-auto px-4 py-8 bg-transparent min-h-screen">
    <h1 class="text-3xl sm:text-4xl font-bold text-primary-text mb-8 text-center">Gestion des Stocks CRM</h1>

    <div class="mb-6">
      <input
        type="text"
        v-model="searchTerm"
        placeholder="Rechercher par nom ou ID de produit..."
        class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-secondary-accent"
      />
    </div>

    <div v-if="crmStockStore.loading" class="text-center text-lg text-text-medium">Chargement des produits...</div>
    <div v-else-if="crmStockStore.error" class="text-center text-lg text-red-500">Erreur: {{ crmStockStore.error }}</div>
    <div v-else-if="filteredProducts.length === 0" class="text-center text-lg text-text-medium">Aucun produit trouvé.</div>
    <div v-else class="overflow-x-auto bg-white rounded-lg shadow-lg border border-card-border">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produit
            </th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gérer le stock
            </th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantité en stock
            </th>
            <th scope="col" class="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50">
            <td class="px-3 py-4 whitespace-nowrap text-sm font-medium text-text-dark">
              {{ product.id }}
            </td>
            <td class="px-3 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <img v-if="product.images && product.images.length > 0" :src="product.images[0].src" :alt="product.name" class="h-10 w-10 rounded-full object-cover mr-2 sm:mr-4 flex-shrink-0">
                <div class="text-sm font-medium text-text-dark">{{ product.name }}</div>
              </div>
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-text-medium">
              <input
                type="checkbox"
                :checked="product.manage_stock"
                @change="handleManageStockChange(product)"
                class="h-4 w-4 text-button-bg border-gray-300 rounded focus:ring-secondary-accent"
              />
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-sm text-text-medium">
              <input
                type="number"
                v-model.number="product.stock_quantity"
                @blur="updateStockOnBlur(product)"
                @keyup.enter="updateStockOnBlur(product)"
                :disabled="!product.manage_stock"
                class="w-16 sm:w-20 p-1 border border-gray-300 rounded-md text-center text-text-dark disabled:bg-gray-100"
              />
            </td>
            <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="adjustStock(product, -1)"
                :disabled="!product.manage_stock"
                class="px-2 py-1 text-xs sm:px-3 sm:py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -1
              </button>
              <button
                @click="adjustStock(product, 1)"
                :disabled="!product.manage_stock"
                class="ml-1 sm:ml-2 px-2 py-1 text-xs sm:px-3 sm:py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +1
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* No specific styles needed, all handled by Tailwind CSS */
</style>

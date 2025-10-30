import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const useCrmStockStore = defineStore('crmStock', () => {
  const products = ref([]);
  const loading = ref(false);
  const error = ref(null);

  async function fetchProducts() {
    loading.value = true;
    error.value = null;
    try {
      const response = await axios.get(`${API_BASE_URL}/products?per_page=100`); // Fetch more products if needed
      // Ensure products have default stock if not present or handle it
      products.value = response.data.map(product => ({
        ...product,
        // Ensure stock_quantity is a number and defaults to 0 if not present
        stock_quantity: typeof product.stock_quantity === 'number' ? product.stock_quantity : 0,
        // Ensure manage_stock is a boolean and defaults to true if not present
        manage_stock: typeof product.manage_stock === 'boolean' ? product.manage_stock : true,
      }));
    } catch (err) {
      error.value = 'Failed to fetch products: ' + (err.response?.data?.details || err.message);
      console.error(error.value);
    } finally {
      loading.value = false;
    }
  }

  async function updateProductStock(productId, newStockQuantity) {
    // Optimistic update
    const productIndex = products.value.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      error.value = `Product with ID ${productId} not found locally.`;
      return;
    }
    const originalStock = products.value[productIndex].stock_quantity;
    const originalManageStock = products.value[productIndex].manage_stock;

    products.value[productIndex].stock_quantity = newStockQuantity;

    try {
      // If stock quantity is updated, ensure manage_stock is true
      const manageStock = newStockQuantity !== null ? true : originalManageStock; // If newStockQuantity is explicitly null, we might want to unmanage stock, otherwise manage it. For simplicity, if stock is set, manage it.
      await axios.patch(`${API_BASE_URL}/products/${productId}/stock`, {
        stock_quantity: newStockQuantity,
        manage_stock: manageStock,
      });
      // Backend successful, local state is correct
    } catch (err) {
      error.value = `Failed to update stock for product ${productId}: ` + (err.response?.data?.details || err.message);
      console.error(error.value);
      // Rollback on error
      products.value[productIndex].stock_quantity = originalStock;
      products.value[productIndex].manage_stock = originalManageStock;
    }
  }

  async function toggleManageStock(productId, manage) {
    const productIndex = products.value.findIndex(p => p.id === productId);
    if (productIndex === -1) {
      error.value = `Product with ID ${productId} not found locally.`;
      return;
    }
    const originalManageStock = products.value[productIndex].manage_stock;
    products.value[productIndex].manage_stock = manage; // Optimistic update

    try {
      await axios.patch(`${API_BASE_URL}/products/${productId}/stock`, {
        manage_stock: manage,
      });
    } catch (err) {
      error.value = `Failed to toggle stock management for product ${productId}: ` + (err.response?.data?.details || err.message);
      console.error(error.value);
      products.value[productIndex].manage_stock = originalManageStock; // Rollback
    }
  }

  const getProductById = computed(() => (id) => products.value.find(p => p.id === id));

  return {
    products,
    loading,
    error,
    fetchProducts,
    updateProductStock,
    toggleManageStock,
    getProductById,
  };
});
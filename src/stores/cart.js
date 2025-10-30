import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', () => {
  // État du panier, initialisé depuis localStorage si disponible
  const items = ref(JSON.parse(localStorage.getItem('cartItems') || '[]'));

  // Watcher pour persister les modifications du panier dans localStorage
  watch(items, (newItems) => {
    localStorage.setItem('cartItems', JSON.stringify(newItems));
  }, { deep: true });

  // Ajoute un article au panier ou met à jour sa quantité
  function addItem(product, quantity = 1) {
    const existingItem = items.value.find(item => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        imageUrl: product.imageUrl || 'https://via.placeholder.com/150?text=No+Image',
        quantity: quantity,
      });
    }
  }

  // Supprime un article du panier
  function removeItem(productId) {
    items.value = items.value.filter(item => item.id !== productId);
  }

  // Met à jour la quantité d'un article
  function updateQuantity(productId, newQuantity) {
    const item = items.value.find(item => item.id === productId);
    if (item) {
      item.quantity = Math.max(0, newQuantity); // Empêche les quantités négatives
      if (item.quantity === 0) {
        removeItem(productId);
      }
    }
  }

  // Calcule le nombre total d'articles distincts dans le panier
  const itemCount = computed(() => {
    return items.value.reduce((count, item) => count + item.quantity, 0);
  });

  // Calcule le total du panier
  const total = computed(() => {
    return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);
  });

  // Vide complètement le panier
  function clearCart() {
    items.value = [];
  }

  return {
    items,
    addItem,
    removeItem,
    updateQuantity,
    itemCount,
    total,
    clearCart
  };
});

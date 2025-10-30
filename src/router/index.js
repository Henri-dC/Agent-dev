import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
// Import the new ProductDetailView
import ProductDetailView from '@/views/ProductDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/chaussures',
      name: 'chaussures',
      component: () => import('@/views/ChaussuresView.vue')
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue')
    },
    // ADDED: Product Detail route
    {
      path: '/products/:id', // Route with a dynamic ID parameter
      name: 'product-detail',
      component: ProductDetailView // Use the newly created component
    }
  ]
})

export default router

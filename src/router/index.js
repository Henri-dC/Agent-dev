import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

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
    // ADDED: Products route
    {
      path: '/products',
      name: 'products',
      component: () => import('@/views/ProductsView.vue')
    }
  ]
})

export default router

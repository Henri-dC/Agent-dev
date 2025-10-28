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
    {
      path: '/vetements',
      name: 'vetements',
      component: () => import('@/views/VetementsView.vue')
    }
  ]
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import ProductDetailView from '@/views/ProductDetailView.vue'
import ServicesView from '@/views/ServicesView.vue'
import PrendreRdvView from '@/views/PrendreRdvView.vue'
import AProposView from '@/views/AProposView.vue'
import ApprocheView from '@/views/ApprocheView.vue'
import ContactDocView from '@/views/ContactDocView.vue'
import ConnexionPatientView from '@/views/ConnexionPatientView.vue'

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
    {
      path: '/products/:id',
      name: 'product-detail',
      component: ProductDetailView
    },
    {
      path: '/services',
      name: 'services',
      component: ServicesView
    },
    {
      path: '/prendre-rdv',
      name: 'prendre-rdv',
      component: PrendreRdvView
    },
    {
      path: '/a-propos',
      name: 'a-propos',
      component: AProposView
    },
    {
      path: '/approche',
      name: 'approche',
      component: ApprocheView
    },
    {
      path: '/contact-doc',
      name: 'contact-doc',
      component: ContactDocView
    },
    {
      path: '/connexion-patient',
      name: 'connexion-patient',
      component: ConnexionPatientView
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

export default router

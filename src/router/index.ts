import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/productsManagement',
      name: 'products',
      component: () => import('../views/product/ProductManagementView.vue')
    },
    {
      path: '/ingredientList',
      name: 'ingredients',
      component: () => import('../views/ingredient/IngredientView.vue')
    },
    {
      path: '/importingredient',
      name: 'importingredients',
      component: () => import('../views/ingredient/import/importIngredientView.vue')
    },
   
  ]
})

export default router

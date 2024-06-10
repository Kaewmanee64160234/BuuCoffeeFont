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
      path: '/userManagement',
      name: 'userManagement',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/user/userManagement.vue')
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
    {
      path: '/importingredient-history',
      name: 'importingredientsHistory',
      component: () => import('../views/ingredient/import/importIngredientHistoryView.vue')
    },
    {
      path: '/checkingredient',
      name: 'checkingredient',
      component: () => import('../views/ingredient/check/checkIngredientView.vue')
    },
    {
      path: '/checkingredient-history',
      name: 'checkingredientHistory',
      component: () => import('../views/ingredient/check/checkIngredientHistoryView.vue')
    },
    {
      path: '/category',
      name: 'category',
      component: () => import('../views/category/CategoryView.vue')
    },
    // toppings
    {
      path: '/topping',
      name: 'topping',
      component: () => import('../views/topping/ToppingView.vue')
    },
    // promotion
    {
      path: '/promotion',
      name: 'promotion',
      component: () => import('../views/promotion/PromotionView.vue')
    },
    // pos
    {
      path: '/pos',
      name: 'pos',
      component: () => import('../views/pos/PosView.vue')
    },
    
  ]
})

export default router

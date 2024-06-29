import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import HomeView from "../views/HomeView.vue";
import NotFound from "@/views/NotFound.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/report/ReportFinance.vue"),
      // meta: { requiresAuth: true },
    },
    {
      path: "/userManagement",
      name: "userManagement",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import("../views/user/userManagement.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/productsManagement",
      name: "products",
      component: () => import("../views/product/ProductManagementView.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/customersManagement",
      name: "customers",
      component: () => import("../views/customer/customerManagement.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/historyReceipt",
      name: "historyReceipt",
      component: () => import("../views/receipt/HistoryReceipt.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/ingredientList",
      name: "ingredients",
      component: () => import("../views/ingredient/IngredientView.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/importingredient",
      name: "importingredients",
      component: () =>
        import("../views/ingredient/import/importIngredientView.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/importingredient-history",
      name: "importingredientsHistory",
      component: () =>
        import("../views/ingredient/import/importIngredientHistoryView.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/checkingredient",
      name: "checkingredient",
      component: () =>
        import("../views/ingredient/check/checkIngredientView.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/checkingredient-history",
      name: "checkingredientHistory",
      component: () =>
        import("../views/ingredient/check/checkIngredientHistoryView.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/category",
      name: "category",
      component: () => import("../views/category/CategoryView.vue"),
      // meta: { requiresAuth: true }
    },
    // toppings
    {
      path: "/topping",
      name: "topping",
      component: () => import("../views/topping/ToppingView.vue"),
      // meta: { requiresAuth: true }
    },
    // promotion
    {
      path: "/promotion",
      name: "promotion",
      component: () => import("../views/promotion/PromotionView.vue"),
      // meta: { requiresAuth: true }
    },
    //Edit
    {
      path: "/report",
      name: "report",
      component: () => import("../views/report/ReportFinance.vue"),
      // meta: { requiresAuth: true }
    },
    // pos
    {
      path: "/pos",
      name: "pos",
      component: () => import("../views/pos/PosView.vue"),
      // meta: { requiresAuth: true }
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/:catchAll(.*)",
      name: "NotFound",
      component: NotFound,
    },
  ],
});
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isLogin) {
      next({ name: "login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;

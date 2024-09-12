import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/userManagement",
      name: "userManagement",
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.

      component: () => import("../views/user/userManagement.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/productsManagement",
      name: "products",
      component: () => import("../views/product/ProductManagementView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/customersManagement",
      name: "customers",
      component: () => import("../views/customer/customerManagement.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/historyReceipt",
      name: "historyReceipt",
      component: () => import("../views/receipt/HistoryReceipt.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/ingredientList",
      name: "ingredients",
      component: () => import("../views/ingredient/IngredientView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/ingredientCoffeeList",
      name: "ingredients_coffee",
      component: () =>
        import("../views/ingredient/subIngredientCoffeeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/ingredientCateringList",
      name: "ingredients_catering",
      component: () =>
        import("../views/ingredient/subIngredientCateringView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/ingredientRiceList",
      name: "ingredients_rice",
      component: () => import("../views/ingredient/subIngredientRiceView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/importingredient",
      name: "importingredients",
      component: () =>
        import("../views/ingredient/import/importIngredientView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/importingredient-history",
      name: "importingredientsHistory",
      component: () =>
        import("../views/ingredient/import/importIngredientHistoryView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/importingredientcoffee",
      name: "importingredientscoffee",
      component: () =>
        import(
          "../views/ingredient/check/withdrawal/subInventoryCoffeeWView.vue"
        ),
      meta: { requiresAuth: true },
    },
    
    {
      path: "/importingredientcatering",
      name: "importingredientscatering",
      component: () =>
        import(
          "../views/ingredient/check/withdrawal/subInventoryCateringWView.vue"
        ),
      meta: { requiresAuth: true },
    },
    {
      path: "/importingredientrice",
      name: "importingredientsrice",
      component: () =>
        import(
          "../views/ingredient/check/withdrawal/subInventoryRiceWView.vue"
        ),
      meta: { requiresAuth: true },
    },
    {
      path: "/returningredientcoffee",
      name: "returningredientcoffee",
      component: () =>
        import("../views/ingredient/check/return/subInventoryCoffeeRView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/returningredientcatering",
      name: "returningredientcatering",
      component: () =>
        import("../views/ingredient/check/return/subInventoryCateringRView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/returningredientrice",
      name: "returningredientrice",
      component: () =>
        import("../views/ingredient/check/return/subInventoryRiceRView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/checkingredient",
      name: "checkingredient",
      component: () =>
        import("../views/ingredient/check/checkIngredientView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/checkingredient-history",
      name: "checkingredientHistory",
      component: () =>
        import("../views/ingredient/check/checkIngredientHistoryView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/history-coffee-store",
      name: "history-coffee-store",
      component: () =>
        import("../views/ingredient/history/histotyRWCoffeeView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/history-rice-store",
      name: "history-rice-store",
      component: () =>
        import("../views/ingredient/history/histotyRWRiceView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/report-inggredient-log",
      name: "report-inggredient-log",
      component: () =>
        import("../views/ingredient/history/ReportIngredientView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/category",
      name: "category",
      component: () => import("../views/category/CategoryView.vue"),
      meta: { requiresAuth: true },
    },
    // toppings
    {
      path: "/topping",
      name: "topping",
      component: () => import("../views/topping/ToppingView.vue"),
      meta: { requiresAuth: true },
    },
    // promotion
    {
      path: "/promotion",
      name: "promotion",
      component: () => import("../views/promotion/PromotionView.vue"),
      meta: { requiresAuth: true },
    },
    //Edit
    {
      path: "/report",
      name: "report",
      component: () => import("../views/report/ReportFinance.vue"),
      meta: { requiresAuth: true },
    },
    // pos
    {
      path: "/pos",
      name: "pos",
      component: () => import("../views/pos/PosView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "loginPage",
      component: () => import("../views/LoginView.vue"),
    },
    // PosCateringView
    {
      path: "/pos-catering",
      name: "posCatering",
      component: () => import("../views/pos/PosCateringView.vue"),
    },
    // historyReceiptCatering
    {
      path: "/historyReceiptCatering",
      name: "historyReceiptCatering",
      component: () => import("../views/receipt/HistoryReceiptCatering.vue"),
    },
    {
      path: "/:catchAll(.*)",
      name: "NotFound",
      component: () => import("../views/NotFound.vue"),
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

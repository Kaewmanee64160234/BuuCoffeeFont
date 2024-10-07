import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user.store";
import { useLoadingStore } from "@/stores/loading.store";
import Swal from "sweetalert2";
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
      path:"/managementRole",
      name:"managementRole",
      component: () => import("@/views/user/permisstionManagement.vue"),
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
      path: "/importingredientCatering",
      name: "importingredientCatering",
      component: () =>
        import("../views/ingredient/import/importIngredientCateringView.vue"),
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
      // meta: { requiresAuth: true },
    },
    {
      path: "/history-rice-store",
      name: "history-rice-store",
      component: () =>
        import("../views/ingredient/history/histotyRWRiceView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/history-catering-store",
      name: "history-catering-store",
      component: () =>
        import("../views/ingredient/history/histotyRWCateringView.vue"),
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
      meta: { requiresAuth: true, roles: ["ผู้จัดการร้าน","พนักงานบัญชี"] },

    },
    //Edit
    {
      path: "/report",
      name: "report",
      component: () => import("../views/report/ReportFinance.vue"),
      meta: { requiresAuth: true, roles: ["ผู้จัดการร้าน","พนักงานบัญชี"] },

    },
    // pos
    {
      path: "/pos-rice",
      name: "pos-rice",
      component: () => import("../views/pos/PosViewRice.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/pos-coffee",
      name: "pos-coffee",
      component: () => import("../views/pos/PosViewCoffee.vue"),
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
    // forbidden
    {
      path: "/forbidden",
      name: "forbidden",
      component: () => import("../views/ForbiddenView.vue"),

    },
    {
      path: "/:catchAll(.*)",
      name: "NotFound",
      component: () => import("../views/NotFound.vue"),
    }
    
  ],
});


router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const userStore = useUserStore();

  // Check if the route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isLogin) {
      // Redirect to login if not authenticated
      next({ name: "login" });
    } else{
      next();
    }
  } else {
    next(); // If the route does not require authentication, proceed as normal
  }
});
let timer: number | null = null;
router.beforeEach((to, from, next) => {
  const loadingStore = useLoadingStore();
  loadingStore.setLoading(true); // Start loading

  // Set a timeout to handle long navigation
  timer = window.setTimeout(() => {
    // If still navigating after 5 seconds, show error dialog
    loadingStore.setLoading(false);

    Swal.fire({
      title: 'Navigation Timeout',
      text: 'Navigation is taking too long. Do you want to go to POS?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, take me there!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        next('/pos'); // Redirect to `/pos` route if user confirms
      } else {
        // Continue without redirecting, or handle as per your needs
        next(false); // Cancel navigation
      }
    });
  }, 10000);

  next();
});

router.afterEach(() => {
  const loadingStore = useLoadingStore();

  // Clear the loading state
  loadingStore.setLoading(false);

  // Clear the timeout if the navigation was successful
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
});

export default router;

import { ref } from "vue";
import { defineStore } from "pinia";
import auth from "@/service/auth";
import router from "@/router";
import { useUserStore } from "./user.store";
import type { User } from '@/types/user.type';

export const useAuthStore = defineStore("auth", () => {
  const authName = ref<User | null>(null);
  const userStore = useUserStore();
  const isLogin = ref(false);

  const login = async (userEmail: string, userPassword: string) => {
    try {
      const response = await auth.login(userEmail, userPassword);
      if (response && response.data) {
        const user__: User = {
          userId: response.data.userId,
          userName: response.data.userName,
          userPassword: response.data.userPassword,
          userRole: response.data.userRole,
          userEmail: response.data.userEmail,
          userStatus: response.data.userStatus,
        };

        localStorage.setItem("user", JSON.stringify(user__));
        userStore.setUser(user__);
        console.log(user__);
        router.push("/report");
      } else {
        console.error("User does not have account");
        return null;
      }

      authName.value = JSON.parse(localStorage.getItem("user") as string);
    } catch (e) {
      console.error("Error in login method:", e);
      throw e; // ส่งต่อ error ไปยัง caller หรือที่ใดก็ได้ที่จะจัดการต่อ
    }
    isLogin.value = true;
  };
  const logout = () => {
    localStorage.removeItem("user");

    authName.value = null;
    userStore.setUser({
      userId: -1,
      userName: "",
      userPassword: "",
      userRole: "",
      userEmail: "",
      userStatus: "",
    });
    isLogin.value = false;
    router.replace("/login");
  };

  const getUserFromLocalStorage = () => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const userObject: User = JSON.parse(userString);
        userStore.setUser(userObject);
        authName.value = userObject;
        isLogin.value = true;
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        isLogin.value = false;
      }
    } else {
      console.log("No user found in localStorage.");
      isLogin.value = false;
    }
  };

  return {
    login,
    logout,
    authName,
    isLogin,
    getUserFromLocalStorage,
  };
});

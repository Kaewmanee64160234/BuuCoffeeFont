import { ref } from "vue";
import { defineStore } from "pinia";
import auth from "@/service/auth";
import router from "@/router";
import { useUserStore } from "./user.store";
import type { User } from "@/types/user.type";

export const useAuthStore = defineStore("auth", () => {
  const authName = ref<User | null>(null);
  const userStore = useUserStore();
  const isLogin = ref(false);

  const login = async (userEmail: string, userPassword: string) => {
    try {
      // Send login request to the backend
      const response = await auth.login(userEmail, userPassword);
      console.log(response);

      if (response && response.data) {
        // Extract user and token from the response
        const token = response.data.access_token; // The JWT token sent by the backend
        console.log(token);

        const user__: User = response.data.user;

        // Store user and token in localStorage
        localStorage.setItem("user", JSON.stringify(user__)); // Store the user data
        localStorage.setItem("token", token); // Store the token

        // Update the user in the store
        userStore.setUser(user__);

        console.log(user__);

        // Redirect to the report page
        if (userStore.currentUser.role.name === "ผู้จัดการร้าน") {
          router.push("/report");
        } else {
          if (userStore.currentUser.role.name === "พนักงานขายข้าว") {
            router.push("/pos-coffee");
          } else {
            router.push("/pos-rice");
          }
        }
      } else {
        console.error("User does not have an account");
        return null;
      }

      // Set the authName from localStorage
      authName.value = JSON.parse(localStorage.getItem("user") as string);
    } catch (e) {
      console.error("Error in login method:", e);
      throw e; // Forward the error for further handling
    }

    // Set login status to true
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

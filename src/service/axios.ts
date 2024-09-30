import axios from "axios";
import router from "@/router";
import { useUserStore } from "@/stores/user.store";
import { useAuthStore } from "@/stores/auth";

// Create an Axios instance
const http = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add an interceptor to include the Bearer token
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Get the token from localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Error in request: ", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration and forbidden access
http.interceptors.response.use(
  (response) => {
    // If there's no error, simply return the response without logging
    return response;
  },
  (error) => {
    const userStore = useUserStore();
    const authStore = useAuthStore();

    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Handle Unauthorized (Token expired or invalid)
          console.warn("Token expired or unauthorized access. Logging out...");
          authStore.logout(); // Call logout function from your store
          router.push("/login"); // Redirect to login page
          break;

        case 403:
          // Handle Forbidden (Access denied)
          console.warn("Access denied. Redirecting to forbidden page...");
          router.push("/forbidden"); // Redirect to a "Forbidden" page or display a warning
          break;

        default:
          console.error("Error in response: ", error); // Log only in case of other errors
          break;
      }
    } else {
      console.error("Error in response: ", error);
    }

    return Promise.reject(error);
  }
);

export default http;

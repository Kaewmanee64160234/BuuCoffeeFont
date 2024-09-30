import axios from "axios";

// Create an Axios instance
const http = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add an interceptor to include the Bearer token
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Get the token from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error("Error in request: ", error);
  return Promise.reject(error);
});

// Add response interceptor to log each response
http.interceptors.response.use((response) => {
  console.log(`Received response from ${response.config.url}`, response);
  return response;
}, (error) => {
  console.error("Error in response: ", error);
  return Promise.reject(error);
});

export default http;

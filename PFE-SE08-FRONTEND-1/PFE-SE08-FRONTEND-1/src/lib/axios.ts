import { useAuthStore } from "@/stores/auth.store";
import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8081";

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json"
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
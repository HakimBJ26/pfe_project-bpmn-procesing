import { useAuthStore } from "@/stores/auth.store";
import axios from "axios";

// API Gateway URL pour les services d'authentification
const gatewayBaseURL = import.meta.env.VITE_API_GATEWAY_URL || "http://localhost:8080";
// Camunda API URL pour les services Camunda
const camundaBaseURL = import.meta.env.VITE_CAMUNDA_API_URL || "http://localhost:8081";

// Instance axios pour les appels à l'API Gateway (auth, user, etc.)
export const axiosInstance = axios.create({
  baseURL: gatewayBaseURL,
  headers: {
    "Content-Type": "application/json"
  },
});

// Instance axios pour les appels directs à Camunda
export const camundaAxiosInstance = axios.create({
  baseURL: camundaBaseURL,
  headers: {
    "Content-Type": "application/json"
  },
});

// Ajouter le token JWT aux requêtes pour l'API Gateway
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

// Ajouter le token JWT aux requêtes pour Camunda
camundaAxiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors for API Gateway
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

// Handle responses and errors for Camunda
camundaAxiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
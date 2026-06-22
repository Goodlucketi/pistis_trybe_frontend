import axios from "axios";
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://pistis-trybe-backend.onrender.com/v1",
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

// Attach access token on every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and errors consistently
api.interceptors.response.use(
  (response) => {
    // Auto-save refreshed token if backend rotates it
    const newToken = response.headers["x-access-token"];
    if (newToken) {
      localStorage.setItem("accessToken", newToken);
      // console.log(response.data.message);
    }
    return response;
  },
  (error) => {
    // No response at all — network/server down
    if (!error.response) {
      toast.error(error.response?.data?.message || "Network error. Please check your connection.");
      
      return Promise.reject({
        message: "Cannot reach the server. Please check your connection.",
        status: 0,
      });
    }

    const { status, data } = error.response;

    // Session expired or invalid token — redirect to login
    if (status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject({ message: "Session expired. Please login again.", status });
    }

    // Handle 403 - Not Admin
    if (error.response.status === 403) {
      toast.error(error.response.data?.message || "Access denied");
    }

    // Return a clean error object with the backend's message
    return Promise.reject({
      message: data?.message || "Something went wrong. Please try again.",
      status,
      details: data?.specialCodeMessage || null,
    });
  }
);

export default api;

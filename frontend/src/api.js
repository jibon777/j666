// src/api.js
import axios from "axios";
import { toast } from 'react-toastify';

// Buat instance axios dengan konfigurasi dasar
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Base URL untuk semua endpoint API
});

// Tambahkan interceptor untuk menyertakan token di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Opsional: Tambahkan interceptor untuk menangani error 401 (Unauthorized)
// Ini akan otomatis logout pengguna jika token mereka tidak valid atau kedaluwarsa.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      toast.error("Sesi Anda telah berakhir. Silakan login kembali.");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      // Redirect ke halaman login
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
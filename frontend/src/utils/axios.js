// src/utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true, // Important pour les cookies JWT
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercepteur pour ajouter le token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers login si non authentifié
      localStorage.removeItem('token');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

export default instance;
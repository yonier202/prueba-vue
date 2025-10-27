import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

/**
 * Interceptor de peticiones HTTP
 * Agrega automáticamente el token de autorización a todas las peticiones
 * Recupera el token desde localStorage y lo incluye en el header Authorization
 */
api.interceptors.request.use((config) => {
  const userString = localStorage.getItem("user");

  if (userString) {
    try {
      const user = JSON.parse(userString); 
      if (user?.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
  }

  return config;
});

export default api;
import axios from 'axios';

// Définir l'URL de base pour toutes les requêtes axios
axios.defaults.baseURL = 'http://192.168.88.160:5131'; // Ajustez le port selon votre configuration backend

// Intercepteur pour ajouter le token à chaque requête
axios.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axios;

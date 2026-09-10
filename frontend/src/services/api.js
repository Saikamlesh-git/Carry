import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://carry-mv1m.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
});

// Attach Authorization header for admin requests and add cache-buster on GET requests
api.interceptors.request.use(
  (config) => {
    // Bust browser/device caching on GET requests
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }

    const token = localStorage.getItem('carry_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept 401 Unauthorized for admin routes
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized on admin endpoint, clear stale token and redirect to admin login
      if (window.location.hash.startsWith('#/admin') && window.location.hash !== '#/admin') {
        localStorage.removeItem('carry_admin_token');
        localStorage.removeItem('carry_admin_user');
        window.location.hash = '/admin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

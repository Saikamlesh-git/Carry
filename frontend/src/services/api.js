import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization header for admin requests if token exists
api.interceptors.request.use(
  (config) => {
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
      // If unauthorized on admin endpoint, clear stale token
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
        localStorage.removeItem('carry_admin_token');
        localStorage.removeItem('carry_admin_user');
        window.location.href = '/admin';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

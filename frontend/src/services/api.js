import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Articles API
export const articlesAPI = {
  getAll: () => api.get('/articles'),
  getById: (id) => api.get(`/articles/${id}`),
  create: (formData) => api.post('/articles', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/articles/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/articles/${id}`),
};

// Demandes API
export const demandesAPI = {
  getAll: () => api.get('/demandes'),
  create: (demandeData) => api.post('/demandes', demandeData),
  approve: (id) => api.put(`/demandes/${id}/approve`),
  reject: (id) => api.put(`/demandes/${id}/reject`),
};

// Dashboard API
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAlerts: () => api.get('/dashboard/alerts'),
  getCharts: () => api.get('/dashboard/charts'),
};

// Mouvements API
export const mouvementsAPI = {
  getAll: () => api.get('/mouvements'),
  create: (mouvementData) => api.post('/mouvements', mouvementData),
};

// Historique API
export const historiqueAPI = {
  getAll: () => api.get('/historique'),
};

export default api;
// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    // Check if token is already formatted with "Bearer "
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    config.headers.Authorization = formattedToken;
  }
  return config;
});

// API Endpoints
export const apiCalls = {
  // Catalog - Products
  getProducts: () => api.get('/catalog/products/'),
  getProduct: (id) => api.get(`/catalog/products/${id}/`),
  updateProductStock: (id, stock) => api.patch(`/catalog/products/${id}/`, { stock }),
  getProductByBarcode: (barcode) => api.get('/catalog/products/by-barcode/', { params: { barcode } }),
  
  // Sales - POS
  getSales: () => api.get('/sales/sales/'),
  getSaleDetail: (id) => api.get(`/sales/sales/${id}/`),
  createSale: (saleData) => api.post('/sales/sales/', saleData),
  completeSale: (id, payments) => api.post(`/sales/sales/${id}/complete/`, { payments }),
  getDailySummary: () => api.get('/sales/sales/daily_summary/'),
  
  // Reports (Dashboard)
  getDashboard: () => api.get('/reports/dashboard/'),
  getSalesSummary: (params) => api.get('/reports/sales-summary/', { params }),
  getTopProducts: (params) => api.get('/reports/top-products/', { params }),
  
  // Auth
  login: (username, password) => api.post('/auth/login/', { username, password }),
  signup: (userData) => api.post('/auth/register/', userData),
  getMe: () => api.get('/auth/users/me/'),
};

export default api;
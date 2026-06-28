// src/services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getAuthToken = () => localStorage.getItem('auth_token');
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = getAuthToken();
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
  setSaleItems: (id, cartItems) => api.post(`/sales/sales/${id}/set_items/`, cartItems),
  completeSale: (id, payments) => api.post(`/sales/sales/${id}/complete/`, { payments }),
  voidSale: (id, payload) => api.post(`/sales/sales/${id}/void/`, payload),
  getReceipt: (id) => api.get(`/sales/sales/${id}/receipt/`),
  getDailySummary: () => api.get('/sales/sales/daily_summary/'),
  createItemVoidRequest: (payload) => api.post('/sales/item-void-requests/', payload),
  approveItemVoidRequest: (id, payload) => api.post(`/sales/item-void-requests/${id}/approve/`, payload),
  denyItemVoidRequest: (id, payload) => api.post(`/sales/item-void-requests/${id}/deny/`, payload),

  // Reports (Dashboard)
  getDashboard: () => api.get('/reports/dashboard/'),
  getSalesSummary: (params) => api.get('/reports/sales-summary/', { params }),
  getTopProducts: (params) => api.get('/reports/top-products/', { params }),
  getInventoryStatus: (params) => api.get('/reports/inventory-status/', { params }),
  getStockInHistory: (params) => api.get('/reports/stock-in-history/', { params }),
  getProfitEstimate: (params) => api.get('/reports/profit-estimate/', { params }),
  getInventoryTurnover: (params) => api.get('/reports/inventory-turnover/', { params }),
  getReorderPoint: (params) => api.get('/reports/reorder-point/', { params }),

  // Auth
  login: (username, password) => api.post('/auth/login/', { username, password }),
  signup: (userData) => api.post('/auth/register/', userData),
  getMe: () => api.get('/auth/users/me/'),
};

export default api;

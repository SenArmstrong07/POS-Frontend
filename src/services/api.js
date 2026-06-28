// src/services/api.js
import axios from 'axios';
import { getApiErrorMessage } from '../utils/apiErrors';
import { showErrorToast, showSuccessToast } from '../utils/toast';

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

// NEW: refresh token storage, same pattern as the access token above.
// Login was only ever saving the access token — the refresh token from
// the backend's response was being silently dropped, so there was nothing
// to use once the access token expired or the page reloaded.
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem('refresh_token', token);
  } else {
    localStorage.removeItem('refresh_token');
  }
};

// Clears both tokens. Used on logout and when refresh itself fails.
export const clearAuthTokens = () => {
  setAuthToken(null);
  setRefreshToken(null);
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

const buildSuccessMessage = (config) => {
  if (config.toast === false || config.toast?.success === false) return null;
  if (config.toast?.success) return config.toast.success;

  const method = (config.method || "get").toLowerCase();
  if (method === "get") return null;

  const url = config.url || "";
  if (url.includes("/auth/login/")) return "Signed in successfully.";
  if (url.includes("/auth/register/")) return "Account created successfully.";
  if (url.includes("/catalog/products/")) return method === "post" ? "Product added successfully." : "Product updated successfully.";
  if (url.includes("/inventory/movements/adjust/")) return "Inventory updated successfully.";
  if (url.includes("/sales/sales/") && url.includes("/complete/")) return "Sale completed successfully.";
  if (url.includes("/sales/sales/") && url.includes("/void/")) return "Sale voided successfully.";
  if (url.includes("/item-void-requests/") && url.includes("/approve/")) return "Item void approved successfully.";
  if (url.includes("/item-void-requests/") && url.includes("/deny/")) return "Item void denied.";

  if (method === "post") return "Saved successfully.";
  if (method === "patch" || method === "put") return "Updated successfully.";
  if (method === "delete") return "Deleted successfully.";
  return null;
};

api.interceptors.response.use(
  (response) => {
    const message = buildSuccessMessage(response.config || {});
    if (message) showSuccessToast(message);
    return response;
  },
  (error) => {
    if (error?.config?.toast !== false && error?.config?.toast?.error !== false) {
      const message = error?.config?.toast?.error || getApiErrorMessage(error, "Request failed.");
      showErrorToast(message);
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const apiCalls = {
  // Catalog - Products
  getProducts: () => api.get('/catalog/products/'),
  getProduct: (id) => api.get(`/catalog/products/${id}/`),
  createProduct: (productData) => api.post('/catalog/products/', productData),
  updateProductStock: (id, stock) => api.patch(`/catalog/products/${id}/`, { stock }),
  getProductByBarcode: (barcode) => api.get('/catalog/products/by-barcode/', { params: { barcode } }),

  // Inventory
  getStockMovements: (params) => api.get('/inventory/movements/', { params }),
  adjustStock: (payload) => api.post('/inventory/movements/adjust/', payload),
  getLowStockProducts: () => api.get('/inventory/movements/low_stock/'),

  // Sales - POS
  getSales: (params) => api.get('/sales/sales/', { params }),
  getSaleDetail: (id) => api.get(`/sales/sales/${id}/`),
  createSale: (saleData) => api.post('/sales/sales/', saleData, { toast: false }),
  setSaleItems: (id, cartItems) => api.post(`/sales/sales/${id}/set_items/`, cartItems, { toast: false }),
  completeSale: (id, payments) => api.post(`/sales/sales/${id}/complete/`, { payments }),
  voidSale: (id, payload) => api.post(`/sales/sales/${id}/void/`, payload),
  getReceipt: (id) => api.get(`/sales/sales/${id}/receipt/`),
  getDailySummary: () => api.get('/sales/sales/daily_summary/'),
  createItemVoidRequest: (payload) => api.post('/sales/item-void-requests/', payload, { toast: false }),
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
  getActivityLogs: (params) => api.get('/auth/activity/', { params, toast: false }),
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
};

export default api;

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

// NEW: on a 401, try to refresh the access token once and retry the
// original request. If refresh also fails (refresh token missing/expired),
// clear storage so the app falls back to the login screen instead of
// looping on 401s.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (!response || response.status !== 401 || config._retried) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      return Promise.reject(error);
    }

    config._retried = true;

    try {
      // Multiple requests can 401 at once — share one in-flight refresh
      // call instead of firing a refresh request per failed request.
      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_BASE_URL}/auth/refresh/`, { refresh: refreshToken })
          .finally(() => {
            refreshPromise = null;
          });
      }
      const refreshRes = await refreshPromise;
      const newAccess = refreshRes.data.access;
      setAuthToken(newAccess);

      // SIMPLE_JWT has ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION on
      // the backend: every successful refresh blacklists the refresh token
      // that was just used and issues a brand new one. If we don't save
      // this, the NEXT refresh attempt uses a dead token and logs the user
      // out — even though this refresh just succeeded.
      if (refreshRes.data.refresh) {
        setRefreshToken(refreshRes.data.refresh);
      }

      config.headers.Authorization = `Bearer ${newAccess}`;
      return api(config);
    } catch (refreshError) {
      clearAuthTokens();
      return Promise.reject(refreshError);
    }
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
  logout: (refresh) => api.post('/auth/logout/', { refresh }),
};

export default api;
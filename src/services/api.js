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

// refresh token storage, same pattern as the access token above.
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

// DRF validation errors normally come back as { field: ["message", ...] }.
// This backend's custom exception handler (apps.common.exceptions) wraps
// them though — observed shape includes a nested object, e.g.
// { errors: { password: ["This password is too common."] } } — so a flat
// read of error.response.data prints "[object Object]" instead of the
// actual reason. This recurses into any nested object value to find the
// real per-field messages, wherever the wrapper puts them.
export const extractFieldErrors = (err) => {
  const data = err?.response?.data;
  if (!data || typeof data !== "object") return null;

  const flatten = (obj, depth = 0) => {
    if (depth > 2) return [];
    return Object.entries(obj).flatMap(([key, value]) => {
      if (key === "code") return [];
      if (Array.isArray(value)) {
        return [`${key}: ${value.join(" ")}`];
      }
      if (value && typeof value === "object") {
        return flatten(value, depth + 1);
      }
      if (key === "detail" || key === "message") {
        return [String(value)];
      }
      return [`${key}: ${value}`];
    });
  };

  const lines = flatten(data);
  return lines.length > 0 ? lines.join(" · ") : null;
};

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
  if (url.includes("/auth/users/") && url.includes("/change_password/")) return "Password updated successfully.";
  if (url.includes("/auth/users/")) {
    if (method === "post") return "User created successfully.";
    if (method === "patch" || method === "put") return "User updated successfully.";
    if (method === "delete") return "User deleted successfully.";
  }

  if (method === "post") return "Saved successfully.";
  if (method === "patch" || method === "put") return "Updated successfully.";
  if (method === "delete") return "Deleted successfully.";
  return null;
};

// Single in-flight refresh shared across simultaneous 401s, so multiple
// failed requests don't each fire their own /auth/refresh/ call.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => {
    const message = buildSuccessMessage(response.config || {});
    if (message) showSuccessToast(message);
    return response;
  },
  async (error) => {
    const { response, config } = error || {};

    // --- 401: try to refresh the access token once and retry. ---
    // This branch returns/throws on its own, so it must run before any
    // toast logic below — otherwise every expired-token request would
    // show an error toast even when the silent refresh-and-retry succeeds.
    if (response?.status === 401 && !config?._retried) {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthTokens();
        // fall through to the toast/reject logic below
      } else {
        config._retried = true;
        try {
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

          // SIMPLE_JWT has ROTATE_REFRESH_TOKENS + BLACKLIST_AFTER_ROTATION:
          // every successful refresh blacklists the token just used and
          // issues a new one. Save it, or the NEXT refresh attempt uses a
          // dead token and logs the user out even though this one worked.
          if (refreshRes.data.refresh) {
            setRefreshToken(refreshRes.data.refresh);
          }

          config.headers.Authorization = `Bearer ${newAccess}`;
          return api(config); // retry succeeds or fails on its own — no toast here either way
        } catch (refreshError) {
          clearAuthTokens();
          return Promise.reject(refreshError);
        }
      }
    }

    // --- everything else (400 validation errors, 403, 404, 500, and the
    // 401-with-no-refresh-token case above): show an error toast unless
    // the caller explicitly opted out. ---
    if (config?.toast !== false && config?.toast?.error !== false) {
      const message =
        config?.toast?.error || extractFieldErrors(error) || getApiErrorMessage(error, "Request failed.");
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

  // User Management (Admin only)
  getUsers: (params) => api.get('/auth/users/', { params }),
  getUser: (id) => api.get(`/auth/users/${id}/`),
  createUser: (userData) => api.post('/auth/users/', userData),
  updateUser: (id, userData) => api.patch(`/auth/users/${id}/`, userData),
  deleteUser: (id) => api.delete(`/auth/users/${id}/`),
  changePassword: (payload) => api.post('/auth/users/change_password/', payload),
  getActivityLog: (params) => api.get('/auth/activity/', { params }),
};

export default api;
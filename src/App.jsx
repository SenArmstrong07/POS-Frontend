import { useState, useEffect } from "react";
import AuthPage from "./components/auth/AuthPage";
import AppLayout from "./components/layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import POS from "./components/pos/POS";
import Inventory from "./components/inventory/Inventory";
import SalesHistory from "./components/sales/SalesHistory";
import Analytics from "./components/analytics/Analytics";
import ToastProvider from "./components/ui/ToastProvider";
import { DEMO_PRODUCTS, DEMO_SALES } from "./constants/demoData";
import { apiCalls, getAuthToken, clearAuthTokens } from "./services/api";
import { getApiErrorMessage } from "./utils/apiErrors";

export default function App() {
  const [user, setUser] = useState(null);
  // true while we check localStorage for an existing session on boot.
  // Without this, the app renders <AuthPage /> on every refresh (since
  // `user` starts null) even when a valid token already exists.
  const [checkingSession, setCheckingSession] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // On first mount, if a token is already in localStorage (e.g. from
  // before a page refresh), validate it against the backend and restore
  // the user session instead of falling back to the login screen.
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setCheckingSession(false);
      return;
    }
    apiCalls
      .getMe()
      .then((res) => {
        const me = res.data || {};
        setUser({
          ...me,
          username: me.username,
          name: me.first_name || me.username,
          email: me.email,
          id: me.id,
          role: me.role,
        });
      })
      .catch(() => {
        // Token invalid/expired and refresh (handled in the api.js
        // interceptor) also failed — clear it so we don't keep retrying.
        clearAuthTokens();
      })
      .finally(() => {
        setCheckingSession(false);
      });
  }, []);

  // Fetch data from Django backend
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [productsRes, salesRes] = await Promise.all([
        apiCalls.getProducts(),
        apiCalls.getSales(),
      ]);
      
      // Handle paginated responses from Django backend
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.results || []);
      const salesData = Array.isArray(salesRes.data) ? salesRes.data : (salesRes.data.results || []);
      
      // Filter to show only completed sales (exclude draft carts)
      const completedSalesOnly = (salesData || []).filter(sale => sale.status === 'COMPLETED');
      
      setProducts(productsData);
      setSales(completedSalesOnly);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch data:", err);
      // Fallback to demo data if backend unavailable
      setProducts(DEMO_PRODUCTS);
      setSales(DEMO_SALES);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleSale = async (saleId, payments) => {
    try {
      const response = await apiCalls.completeSale(saleId, payments);
      await fetchData(false);
      return response.data;
    } catch (err) {
      console.error("Failed to save sale:", err);
      if (err.response?.data) {
        console.error("Backend error response:", JSON.stringify(err.response.data, null, 2));
      }
      const message = getApiErrorMessage(err, "Failed to save sale");
      setError(message);
      throw err;
    }
  };

  const refreshData = async () => {
    await fetchData(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    // Tokens are stored in localStorage by AuthPage's handleLoginSubmit.
  };

  // Clears both tokens (not just resetting `user` state) so a stale
  // access/refresh pair can't silently log the "logged out" user back
  // in on the next page load's session check above.
  const handleLogout = () => {
    clearAuthTokens();
    setUser(null);
  };

  // While checking localStorage for an existing session, render nothing
  // instead of flashing the login screen for one frame on every refresh.
  if (checkingSession) {
    return null;
  }

  if (!user) {
    return (
      <ToastProvider>
        <AuthPage onLogin={handleLogin} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <AppLayout user={user} onLogout={handleLogout} activeTab={tab} setActiveTab={setTab}>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {!loading && (
          <>
            {tab === "dashboard" && <Dashboard products={products} sales={sales} />}
            {tab === "pos" && <POS products={products} onSale={handleSale} onRefreshData={refreshData} />}
            {tab === "inventory" && <Inventory products={products} onRefreshData={refreshData} />}
            {tab === "sales" && <SalesHistory sales={sales} onRefreshData={refreshData} />}
            {tab === "reports" && <Analytics />}
          </>
        )}
      </AppLayout>
    </ToastProvider>
  );
}
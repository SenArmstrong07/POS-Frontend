import { useState, useEffect } from "react";
import AuthPage from "./components/auth/AuthPage";
import AppLayout from "./components/layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import POS from "./components/pos/POS";
import Inventory from "./components/inventory/Inventory";
import SalesHistory from "./components/sales/SalesHistory";
import Analytics from "./components/analytics/Analytics";
import { DEMO_PRODUCTS, DEMO_SALES } from "./constants/demoData";
import { apiCalls } from "./services/api";
import { getApiErrorMessage } from "./utils/apiErrors";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    // Token should be stored in localStorage by your auth logic
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <AppLayout user={user} onLogout={() => setUser(null)} activeTab={tab} setActiveTab={setTab}>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && (
        <>
          {tab === "dashboard" && <Dashboard products={products} sales={sales} />}
          {tab === "pos" && <POS products={products} onSale={handleSale} onRefreshData={refreshData} />}
          {tab === "inventory" && <Inventory products={products} setProducts={setProducts} />}
          {tab === "sales" && <SalesHistory sales={sales} onRefreshData={refreshData} />}
          {tab === "reports" && <Analytics />}
        </>
      )}
    </AppLayout>
  );
}

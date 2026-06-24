import { useState, useEffect } from "react";
import AuthPage from "./components/auth/AuthPage";
import AppLayout from "./components/layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import POS from "./components/pos/POS";
import Inventory from "./components/inventory/Inventory";
import SalesHistory from "./components/sales/SalesHistory";
import { DEMO_PRODUCTS, DEMO_SALES } from "./constants/demoData";
import { apiCalls } from "./services/api";

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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, salesRes] = await Promise.all([
        apiCalls.getProducts(),
        apiCalls.getSales(),
      ]);
      
      // Handle paginated responses from Django backend
      const productsData = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.results || []);
      const salesData = Array.isArray(salesRes.data) ? salesRes.data : (salesRes.data.results || []);
      
      setProducts(productsData);
      setSales(salesData);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch data:", err);
      // Fallback to demo data if backend unavailable
      setProducts(DEMO_PRODUCTS);
      setSales(DEMO_SALES);
    } finally {
      setLoading(false);
    }
  };

  const handleSale = async (sale, cart) => {
    try {
      // Send sale to backend
      await apiCalls.createSale(sale);

      // Update local state
      setSales((s) => [sale, ...s]);
      setProducts((prev) =>
        prev.map((p) => {
          const ci = cart.find((i) => i.id === p.id);
          return ci ? { ...p, stock: Math.max(0, p.stock - ci.qty) } : p;
        })
      );
    } catch (err) {
      console.error("Failed to save sale:", err);
      setError("Failed to save sale");
    }
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
          {tab === "pos" && <POS products={products} onSale={handleSale} />}
          {tab === "inventory" && <Inventory products={products} setProducts={setProducts} />}
          {tab === "sales" && <SalesHistory sales={sales} />}
        </>
      )}
    </AppLayout>
  );
}
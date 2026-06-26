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

  const handleSale = async (sale, cart) => {
    try {
      console.log("Creating sale with cart:", cart);
      console.log("Sale data:", sale);
      
      // Format cart items for backend: [{"product": id, "quantity": qty}, ...]
      const cartItems = (cart || []).map(item => ({
        product: item.id,
        quantity: item.qty || 1
      }));

      // Step 1: Create a new sale (cart) with items
      const saleRes = await apiCalls.createSale({
        cart: cartItems,
        discount: sale.discount || null
      });
      console.log("Sale created:", saleRes.data);
      const saleId = saleRes.data.id;

      // Step 2: Complete the sale with payment info
      // Convert payment method to uppercase (backend expects: CASH, CARD, GCASH, MAYA)
      const paymentMethod = (sale.payment || 'Cash').toUpperCase();
      
      // Calculate total sale amount (sum of all items)
      const saleAmount = parseFloat(sale.total) || 0;
      
      // Tendered amount is what customer gave (from the form input)
      // This is passed in sale.tendered
      const tenderedAmount = parseFloat(sale.tendered) || 0;
      
      const payments = [{
        method: paymentMethod,
        amount: saleAmount,
        tendered: tenderedAmount  // Include tendered field for CASH payment validation
      }];
      console.log("Completing sale with payments:", payments);
      
      await apiCalls.completeSale(saleId, payments);
      console.log("Sale completed successfully");

      // Step 3: Refresh sales data from backend to ensure persistence
      // Don't show loading state during checkout to keep receipt visible
      console.log("Refreshing data after successful sale...");
      await fetchData(false);
    } catch (err) {
      console.error("Failed to save sale:", err);
      if (err.response?.data) {
        console.error("Backend error response:", JSON.stringify(err.response.data, null, 2));
      }
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
          {tab === "reports" && <Analytics />}
        </>
      )}
    </AppLayout>
  );
}
import { useState } from "react";
import AuthPage from "./components/auth/AuthPage";
import AppLayout from "./components/layout/Layout";
import Dashboard from "./components/dashboard/Dashboard";
import POS from "./components/pos/POS";
import Inventory from "./components/inventory/Inventory";
import SalesHistory from "./components/sales/SalesHistory";
import { DEMO_PRODUCTS, DEMO_SALES } from "./constants/demoData";

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [products, setProducts] = useState(DEMO_PRODUCTS);
  const [sales, setSales] = useState(DEMO_SALES);

  const handleSale = (sale, cart) => {
    setSales((s) => [sale, ...s]);
    setProducts((prev) =>
      prev.map((p) => {
        const ci = cart.find((i) => i.id === p.id);
        return ci ? { ...p, stock: Math.max(0, p.stock - ci.qty) } : p;
      })
    );
  };

  if (!user) return <AuthPage onLogin={setUser} />;

  return (
    <AppLayout user={user} onLogout={() => setUser(null)} activeTab={tab} setActiveTab={setTab}>
      {tab === "dashboard" && <Dashboard products={products} sales={sales} />}
      {tab === "pos" && <POS products={products} onSale={handleSale} />}
      {tab === "inventory" && <Inventory products={products} setProducts={setProducts} />}
      {tab === "sales" && <SalesHistory sales={sales} />}
    </AppLayout>
  );
}
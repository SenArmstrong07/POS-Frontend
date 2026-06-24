import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { MoneyIcon, CartIcon, BoxIcon, AlertIcon } from "../icons/Icons";
import MetricCard from "./MetricCard";
import RecentSales from "./RecentSales";
import LowStockList from "./LowStockList";

export default function Dashboard({ products, sales }) {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  // Filter today's sales - handle different date field names and formats
  const todaySales = (sales || []).filter((s) => {
    if (!s) return false;
    // Check various possible date fields
    const dateField = s.date || s.created_at || s.created || s.timestamp;
    if (!dateField) return false;
    // Convert to string and check if it starts with today's date
    const dateStr = String(dateField);
    return dateStr.startsWith(today) || dateStr.includes(today);
  });
  
  const todayTotal = todaySales.reduce((a, s) => a + (s.total || s.amount || 0), 0);
  const lowStock = (products || []).filter((p) => p && p.stock !== undefined && p.reorder !== undefined && p.stock <= p.reorder);
  const recent = (sales || []).slice(0, 5);

  const metrics = [
    { label: "Today's revenue", value: fmt(todayTotal), icon: <MoneyIcon />, color: COLORS.primary, bg: COLORS.primaryLight },
    { label: "New sales today", value: todaySales.length, icon: <CartIcon />, color: COLORS.info, bg: "#e6f1fb" },
    { label: "Active products", value: products.length, icon: <BoxIcon />, color: COLORS.accent, bg: "#faece7" },
    { label: "Low stock alerts", value: lowStock.length, icon: <AlertIcon />, color: COLORS.danger, bg: "#fef2f2" },
  ];

  return (
    <div>
      {/* Metrics row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
          marginBottom: "1.5rem",
        }}
      >
        {metrics.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            icon={m.icon}
            color={m.color}
            bg={m.bg}
          />
        ))}
      </div>

      {/* Bottom panels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
        <RecentSales sales={recent} />
        <LowStockList products={lowStock} />
      </div>
    </div>
  );
}
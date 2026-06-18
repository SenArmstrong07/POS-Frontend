import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { MoneyIcon, CartIcon, BoxIcon, AlertIcon } from "../icons/Icons";
import MetricCard from "./MetricCard";
import RecentSales from "./RecentSales";
import LowStockList from "./LowStockList";

export default function Dashboard({ products, sales }) {
  const todaySales = sales.filter((s) => s.date.startsWith("2025-06-17"));
  const todayTotal = todaySales.reduce((a, s) => a + s.total, 0);
  const lowStock = products.filter((p) => p.stock <= p.reorder);
  const recent = sales.slice(0, 5);

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
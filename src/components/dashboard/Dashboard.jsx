import { useCallback, useEffect, useMemo, useState } from "react";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { MoneyIcon, CartIcon, BoxIcon, AlertIcon, ReportIcon } from "../icons/Icons";
import MetricCard from "./MetricCard";
import RecentSales from "./RecentSales";
import LowStockList from "./LowStockList";
import { apiCalls } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { isProductLowStock } from "../../utils/productFields";

const normalizeList = (data) => Array.isArray(data) ? data : (data?.results || []);
const normalizeCount = (data, fallback) => Number.isFinite(Number(data?.count)) ? Number(data.count) : fallback;

const toISODate = (date) => date.toISOString().slice(0, 10);
const daysAgoISO = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toISODate(date);
};

const formatAction = (action) => {
  if (!action) return "Activity";
  return String(action)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const parseAmount = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

function OverviewPanel({ title, icon, children }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        padding: "1.25rem",
        minHeight: 190,
      }}
    >
      <h3
        style={{
          margin: "0 0 1rem",
          fontSize: 14,
          fontWeight: 700,
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: COLORS.primary }}>{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function MiniBar({ label, value, max, color = COLORS.primary }) {
  const width = max > 0 ? Math.max(5, Math.min(100, (value / max) * 100)) : 0;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: COLORS.text, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: COLORS.muted }}>{value}</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: COLORS.faint, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: color, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function EmptyMiniState({ children }) {
  return (
    <div style={{ color: COLORS.muted, fontSize: 13, textAlign: "center", padding: "2rem 0" }}>
      {children}
    </div>
  );
}

function TopProductsList({ products }) {
  if (products.length === 0) {
    return <EmptyMiniState>No product sales in the last 30 days</EmptyMiniState>;
  }

  return (
    <div>
      {products.map((product, index) => {
        const name = product.product__name || product.product_name || product.name || "Unknown product";
        const quantity = parseAmount(product.quantity_sold);
        const revenue = parseAmount(product.revenue);

        return (
          <div
            key={product.product || product.id || name}
            style={{
              display: "grid",
              gridTemplateColumns: "32px minmax(0,1fr) auto",
              gap: 10,
              alignItems: "center",
              padding: "9px 0",
              borderBottom: `1px solid ${COLORS.faint}`,
            }}
          >
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: index === 0 ? COLORS.primaryLight : COLORS.faint,
                color: index === 0 ? COLORS.primaryDark : COLORS.muted,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {index + 1}
            </span>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  color: COLORS.text,
                  fontSize: 13,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </p>
              <p style={{ margin: "2px 0 0", color: COLORS.muted, fontSize: 12 }}>
                {quantity.toLocaleString("en-PH", { maximumFractionDigits: 2 })} sold
              </p>
            </div>
            <span style={{ color: COLORS.primary, fontSize: 13, fontWeight: 800, whiteSpace: "nowrap" }}>
              {fmt(revenue)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({ products = [], sales = [] }) {
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [completedSales, setCompletedSales] = useState(sales || []);
  const [completedSalesCount, setCompletedSalesCount] = useState((sales || []).length);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockLoaded, setLowStockLoaded] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const [overviewStatus, setOverviewStatus] = useState("loading");

  const fetchDashboardData = useCallback(async () => {
    setOverviewStatus("loading");
    try {
      const [summaryRes, salesRes, lowStockRes, topProductsRes] = await Promise.allSettled([
        apiCalls.getDashboard(),
        apiCalls.getSales({ status: "COMPLETED", ordering: "-completed_at", page_size: 200 }),
        apiCalls.getLowStockProducts(),
        apiCalls.getTopProducts({
          start: daysAgoISO(29),
          end: toISODate(new Date()),
          limit: 5,
        }),
      ]);

      if (summaryRes.status === "fulfilled") {
        setDashboardSummary(summaryRes.value.data);
      } else {
        console.error("Failed to fetch dashboard summary:", getApiErrorMessage(summaryRes.reason));
        setDashboardSummary(null);
      }

      if (salesRes.status === "fulfilled") {
        const salesData = normalizeList(salesRes.value.data).filter((sale) => sale.status === "COMPLETED");
        setCompletedSales(salesData);
        setCompletedSalesCount(normalizeCount(salesRes.value.data, salesData.length));
        setRecentTransactions(salesData.slice(0, 5));
      } else {
        console.error("Failed to fetch dashboard transactions:", getApiErrorMessage(salesRes.reason));
        const fallbackSales = (sales || []).filter((sale) => sale.status === "COMPLETED");
        setCompletedSales(fallbackSales);
        setCompletedSalesCount(fallbackSales.length);
        setRecentTransactions(fallbackSales.slice(0, 5));
      }

      if (lowStockRes.status === "fulfilled") {
        setLowStockProducts(normalizeList(lowStockRes.value.data));
        setLowStockLoaded(true);
      } else {
        console.error("Failed to fetch low stock products:", getApiErrorMessage(lowStockRes.reason));
        setLowStockProducts((products || []).filter(isProductLowStock));
        setLowStockLoaded(false);
      }

      if (topProductsRes.status === "fulfilled") {
        setTopProducts(normalizeList(topProductsRes.value.data).slice(0, 5));
      } else {
        console.error("Failed to fetch top products:", getApiErrorMessage(topProductsRes.reason));
        setTopProducts([]);
      }

      setOverviewStatus("ready");
    } catch (err) {
      console.error("Failed to fetch dashboard data:", getApiErrorMessage(err));
      setOverviewStatus("error");
    }
  }, [products, sales]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const lowStock = lowStockLoaded ? lowStockProducts : (products || []).filter(isProductLowStock);
  const activeProducts = (products || []).filter((product) => product?.is_active !== false);
  const todayStats = dashboardSummary?.today || {};
  const todayRevenue = parseAmount(todayStats.gross_sales);
  const todayTransactions = Number(todayStats.transactions) || 0;
  const lowStockCount = Number.isFinite(Number(dashboardSummary?.low_stock_count))
    ? Number(dashboardSummary.low_stock_count)
    : lowStock.length;

  const totalSalesRevenue = completedSales.reduce((sum, sale) => sum + parseAmount(sale.total), 0);

  const paymentMix = useMemo(() => {
    const counts = {};
    completedSales.forEach((sale) => {
      const payments = Array.isArray(sale.payments) ? sale.payments : [];
      if (payments.length === 0) {
        counts.Pending = (counts.Pending || 0) + 1;
        return;
      }

      payments.forEach((payment) => {
        const label = formatAction(payment.method);
        counts[label] = (counts[label] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [completedSales]);

  const maxPaymentCount = paymentMix.reduce((max, item) => Math.max(max, item.value), 0);
  const healthyStockCount = Math.max(0, activeProducts.length - lowStockCount);
  const maxStockCount = Math.max(healthyStockCount, lowStockCount);

  const metrics = [
    { label: "Total sales", value: fmt(totalSalesRevenue), icon: <MoneyIcon />, color: COLORS.primary, bg: COLORS.primaryLight },
    { label: "Today's revenue", value: fmt(todayRevenue), icon: <ReportIcon />, color: COLORS.info, bg: "#e6f1fb" },
    { label: "Total transactions", value: completedSalesCount, icon: <CartIcon />, color: COLORS.accent, bg: "#faece7" },
    { label: "Active products", value: activeProducts.length, icon: <BoxIcon />, color: COLORS.success, bg: "#eef9e9" },
    { label: "Low stock count", value: lowStockCount, icon: <AlertIcon />, color: COLORS.danger, bg: "#fef2f2" },
    { label: "Sales today", value: todayTransactions, icon: <CartIcon />, color: COLORS.info, bg: "#eff6ff" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: 18, color: COLORS.text, fontWeight: 700 }}>
            Analytics Overview
          </h2>
          <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 13 }}>
            Live business snapshot from backend sales and inventory records.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchDashboardData}
          disabled={overviewStatus === "loading"}
          style={{
            border: `1px solid ${COLORS.border}`,
            background: overviewStatus === "loading" ? COLORS.faint : COLORS.card,
            color: COLORS.text,
            borderRadius: 8,
            padding: "9px 14px",
            fontSize: 13,
            fontWeight: 700,
            cursor: overviewStatus === "loading" ? "not-allowed" : "pointer",
          }}
        >
          {overviewStatus === "loading" ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
          marginBottom: "1rem",
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 16,
          marginBottom: "1.5rem",
        }}
      >
        <OverviewPanel title="Payment mix" icon={<MoneyIcon />}>
          {paymentMix.length === 0 ? (
            <EmptyMiniState>No completed payment data yet</EmptyMiniState>
          ) : (
            paymentMix.map((item) => (
              <MiniBar key={item.label} label={item.label} value={item.value} max={maxPaymentCount} />
            ))
          )}
        </OverviewPanel>

        <OverviewPanel title="Inventory health" icon={<BoxIcon />}>
          <MiniBar label="Healthy stock" value={healthyStockCount} max={maxStockCount} color={COLORS.primary} />
          <MiniBar label="Low stock" value={lowStockCount} max={maxStockCount} color={COLORS.danger} />
          <p style={{ margin: "12px 0 0", color: COLORS.muted, fontSize: 12 }}>
            Based on active products and backend reorder thresholds.
          </p>
        </OverviewPanel>

        <OverviewPanel title="Top products" icon={<ReportIcon />}>
          <TopProductsList products={topProducts} />
        </OverviewPanel>
      </div>

      {overviewStatus === "error" && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "12px 14px",
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: COLORS.danger,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Some dashboard analytics could not be loaded. Existing product and sales data are still shown below.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
        <RecentSales sales={recentTransactions} />
        <LowStockList products={lowStock} />
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { MoneyIcon, CartIcon, BoxIcon, AlertIcon } from "../icons/Icons";
import MetricCard from "./MetricCard";
import RecentSales from "./RecentSales";
import LowStockList from "./LowStockList";
import { apiCalls } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { isProductLowStock } from "../../utils/productFields";

export default function Dashboard({ products, sales }) {
  const [dailySummary, setDailySummary] = useState(null);
  const [todaySalesCount, setTodaySalesCount] = useState(0);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [lowStockLoaded, setLowStockLoaded] = useState(false);
  
  // Fetch today's sales summary from backend
  useEffect(() => {
    const fetchDailySummary = async () => {
      try {
        const res = await apiCalls.getDailySummary();
        console.log("Daily summary response:", res.data);
        setDailySummary(res.data);
        // Extract count of sales if available
        if (res.data && res.data.sales_count !== undefined) {
          setTodaySalesCount(res.data.sales_count);
        }
      } catch (err) {
        console.error("Failed to fetch daily summary:", err);
        // Fall back to manual calculation
      }
    };
    fetchDailySummary();
  }, [sales]); // Re-fetch when sales list changes

  useEffect(() => {
    const fetchLowStock = async () => {
      try {
        const response = await apiCalls.getLowStockProducts();
        const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
        setLowStockProducts(data);
        setLowStockLoaded(true);
      } catch (err) {
        console.error("Failed to fetch low stock products:", getApiErrorMessage(err));
        setLowStockProducts((products || []).filter(isProductLowStock));
        setLowStockLoaded(false);
      }
    };
    fetchLowStock();
  }, [products]);
  
  // Parse today's revenue from daily summary (endpoint returns 'gross_sales')
  // Also calculate from sales list as fallback if endpoint shows 0
  const endpointTotal = dailySummary ? parseFloat(dailySummary.gross_sales || dailySummary.total_revenue || dailySummary.total || 0) || 0 : 0;
  
  // Fallback: calculate today's total from sales list for transactions made today
  const calculateTodayTotal = () => {
    if (endpointTotal > 0) return endpointTotal;
    // If endpoint returns 0, calculate from sales list (handles recently created transactions)
    const today = new Date().toISOString().split('T')[0];
    return (sales || []).reduce((sum, sale) => {
      const saleDate = (sale.created_at || sale.date || '').split('T')[0];
      if (saleDate === today) {
        const amount = parseFloat(sale.total || sale.amount || 0) || 0;
        return sum + amount;
      }
      return sum;
    }, 0);
  };
  
  const todayTotal = calculateTodayTotal();
  const todaySalesCountDisplay = todaySalesCount || (dailySummary?.transactions || dailySummary?.sales_count || 0);
  
  const lowStock = lowStockLoaded ? lowStockProducts : (products || []).filter(isProductLowStock);
  const recent = (sales || []).slice(0, 5);

  const metrics = [
    { label: "Today's revenue", value: fmt(todayTotal), icon: <MoneyIcon />, color: COLORS.primary, bg: COLORS.primaryLight },
    { label: "New sales today", value: todaySalesCountDisplay, icon: <CartIcon />, color: COLORS.info, bg: "#e6f1fb" },
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

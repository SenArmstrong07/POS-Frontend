import { useState } from "react";
import { COLORS } from "../../constants/colors";
import SalesSummaryChart from "./SalesSummaryChart";
import TopProductsChart from "./TopProductsChart";
import InventoryStatusTable from "./InventoryStatusTable";
import StockInHistoryTable from "./StockInHistoryTable";
import ProfitEstimateCard from "./ProfitEstimateCard";
import InventoryTurnoverChart from "./InventoryTurnoverChart";
import ReorderPointTable from "./ReorderPointTable";

const SECTIONS = [
  { id: "sales", label: "Sales summary" },
  { id: "top-products", label: "Top products" },
  { id: "inventory", label: "Inventory status" },
  { id: "stock-in", label: "Stock-in history" },
  { id: "profit", label: "Profit estimate" },
  { id: "turnover", label: "Turnover" },
  { id: "reorder", label: "Reorder points" },
];

export default function Analytics() {
  const [section, setSection] = useState("sales");

  return (
    <div>
      {/* ── Tab bar ── */}
      <div
        style={{
          display: "flex",
          gap: 2,
          overflowX: "auto",
          paddingBottom: 0,
          marginBottom: "1.75rem",
          borderBottom: `1px solid ${COLORS.border}`,
          scrollbarWidth: "none",
        }}
      >
        {SECTIONS.map((s) => {
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              style={{
                border: "none",
                background: "transparent",
                padding: "10px 16px",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                whiteSpace: "nowrap",
                cursor: "pointer",
                color: active ? COLORS.primaryDark : COLORS.muted,
                borderBottom: active
                  ? `2px solid ${COLORS.primary}`
                  : "2px solid transparent",
                marginBottom: -1,
                borderRadius: "6px 6px 0 0",
                transition: "color .15s, border-color .15s",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ── Section content with fade-in on switch ── */}
      <div
        key={section}
        style={{
          animation: "fadeUp .22s ease both",
        }}
      >
        {section === "sales" && <SalesSummaryChart />}
        {section === "top-products" && <TopProductsChart />}
        {section === "inventory" && <InventoryStatusTable />}
        {section === "stock-in" && <StockInHistoryTable />}
        {section === "profit" && <ProfitEstimateCard />}
        {section === "turnover" && <InventoryTurnoverChart />}
        {section === "reorder" && <ReorderPointTable />}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
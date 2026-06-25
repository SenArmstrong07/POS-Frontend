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
      <div
        style={{
          display: "flex",
          gap: 4,
          overflowX: "auto",
          paddingBottom: 4,
          marginBottom: "1.5rem",
          borderBottom: `1px solid ${COLORS.border}`,
        }}
      >
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              border: "none",
              background: "transparent",
              padding: "10px 14px",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              cursor: "pointer",
              color: section === s.id ? COLORS.primaryDark : COLORS.muted,
              borderBottom: section === s.id ? `2px solid ${COLORS.primary}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "sales" && <SalesSummaryChart />}
      {section === "top-products" && <TopProductsChart />}
      {section === "inventory" && <InventoryStatusTable />}
      {section === "stock-in" && <StockInHistoryTable />}
      {section === "profit" && <ProfitEstimateCard />}
      {section === "turnover" && <InventoryTurnoverChart />}
      {section === "reorder" && <ReorderPointTable />}
    </div>
  );
}
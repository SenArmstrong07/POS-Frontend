import { useState, useEffect } from "react";
import { COLORS } from "../../constants/colors";
import { fmt, today } from "../../utils/format";
import { apiCalls } from "../../services/api";
import { MoneyIcon, ReceiptIcon, AlertIcon, ReportIcon } from "../icons/Icons";
import MetricCard from "../dashboard/MetricCard";

export default function DashboardSnapshot() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  
  useEffect(() => {
    let active = true;
    setStatus("loading");
    apiCalls
      .getDashboard()
      .then((res) => {
        if (!active) return;
        setData(res.data);
        setStatus("ready");
      })
      .catch(() => {
        if (!active) return;
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
        Loading dashboard…
      </p>
    );
  }
  if (status === "error") {
    return (
      <p style={{ color: COLORS.danger, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
        Couldn't load the dashboard snapshot.
      </p>
    );
  }

  const { today: todayStats, low_stock_count, top_item } = data;

  const metrics = [
    {
      label: "Gross sales today",
      value: fmt(todayStats.gross_sales),
      icon: <MoneyIcon />,
      color: COLORS.primary,
      bg: COLORS.primaryLight,
    },
    {
      label: "Transactions today",
      value: todayStats.transactions,
      icon: <ReceiptIcon />,
      color: COLORS.info,
      bg: "#e6f1fb",
    },
    {
      label: "Low stock alerts",
      value: low_stock_count,
      icon: <AlertIcon />,
      color: low_stock_count > 0 ? COLORS.danger : COLORS.primary,
      bg: low_stock_count > 0 ? "#fef2f2" : COLORS.primaryLight,
    },
    {
      label: "Top item today",
      value: top_item ? top_item.name : "—",
      icon: <ReportIcon />,
      color: COLORS.accent,
      bg: "#faece7",
    },
  ];

  return (
    <div>
      <p style={{ margin: "0 0 1rem", fontSize: 13, color: COLORS.muted }}>{today()}</p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 16,
        }}
      >
        {metrics.map((m) => (
          <MetricCard key={m.label} label={m.label} value={m.value} icon={m.icon} color={m.color} bg={m.bg} />
        ))}
      </div>
    </div>
  );
}
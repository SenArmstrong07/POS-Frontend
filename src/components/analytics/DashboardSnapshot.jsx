import { useState, useEffect } from "react";
import { COLORS } from "../../constants/colors";
import { fmt, today } from "../../utils/format";
import { apiCalls } from "../../services/api";
import { MoneyIcon, ReceiptIcon, AlertIcon, ReportIcon } from "../icons/Icons";

function Skeleton({ width = "100%", height = 18, radius = 6, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
        backgroundSize: "600px 100%",
        animation: "shimmer 1.4s infinite linear",
        ...style,
      }}
    />
  );
}

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
    return () => { active = false; };
  }, []);

  if (status === "loading") {
    return (
      <>
        <style>{`@keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }`}</style>
        <Skeleton width={160} height={12} style={{ marginBottom: 16 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 16,
                padding: 20,
                boxShadow: "0 1px 3px rgba(15,23,42,.06)",
              }}
            >
              <Skeleton width="55%" height={11} style={{ marginBottom: 14 }} />
              <Skeleton width="75%" height={26} />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (status === "error") {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 16px",
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 12,
          color: COLORS.danger,
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="7.5" stroke={COLORS.danger} strokeWidth="1.5" />
          <path d="M8 4.5v4M8 10.5v1" stroke={COLORS.danger} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Couldn't load the dashboard snapshot.
      </div>
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
      bg: "#eff6ff",
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
      bg: "#fff7ed",
    },
  ];

  return (
    <div>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .metric-card { transition: box-shadow .18s, transform .18s; animation: fadeUp .28s ease both; }
        .metric-card:hover { box-shadow: 0 8px 24px rgba(15,23,42,.10) !important; transform: translateY(-2px); }
      `}</style>
      <p
        style={{
          margin: "0 0 1rem",
          fontSize: 12,
          color: COLORS.muted,
          fontWeight: 500,
          letterSpacing: ".04em",
          textTransform: "uppercase",
        }}
      >
        {today()}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 12,
        }}
      >
        {metrics.map((m, i) => (
          <div
            key={m.label}
            className="metric-card"
            style={{
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 16,
              padding: "18px 20px",
              boxShadow: "0 1px 3px rgba(15,23,42,.06)",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              animationDelay: `${i * 60}ms`,
              cursor: "default",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: m.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: m.color,
                flexShrink: 0,
              }}
            >
              {m.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  margin: "0 0 5px",
                  fontSize: 11,
                  fontWeight: 600,
                  color: COLORS.muted,
                  letterSpacing: ".05em",
                  textTransform: "uppercase",
                }}
              >
                {m.label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 20,
                  fontWeight: 700,
                  color: COLORS.text,
                  lineHeight: 1.2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {m.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
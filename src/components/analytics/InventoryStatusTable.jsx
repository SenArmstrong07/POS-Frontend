import { useState, useEffect } from "react";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { apiCalls } from "../../services/api";
import { num } from "./numeric";
import { BoxIcon } from "../icons/Icons";

function Skeleton({ width = "100%", height = 18, radius = 6, style = {} }) {
  return (
    <div style={{ width, height, borderRadius: radius, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "600px 100%", animation: "shimmer 1.4s infinite linear", ...style }} />
  );
}

function SummaryStat({ label, value, tone, delay = 0 }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(15,23,42,.05)", animation: "fadeUp .28s ease both", animationDelay: `${delay}ms` }}>
      <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: COLORS.muted }}>{label}</p>
      <p style={{ margin: 0, fontSize: 21, fontWeight: 700, color: tone || COLORS.text, lineHeight: 1.15 }}>{value}</p>
    </div>
  );
}

function PagerButton({ disabled, onClick, children }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        border: `1px solid ${COLORS.border}`,
        background: COLORS.card,
        color: disabled ? COLORS.muted : COLORS.text,
        borderRadius: 8,
        padding: "7px 16px",
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        boxShadow: disabled ? "none" : "0 1px 3px rgba(15,23,42,.06)",
        transition: "background .15s, box-shadow .12s, transform .1s",
      }}
    >
      {children}
    </button>
  );
}

export default function InventoryStatusTable() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    apiCalls
      .getInventoryStatus({ page })
      .then((res) => { if (!active) return; setData(res.data); setStatus("ready"); })
      .catch(() => { if (!active) return; setStatus("error"); });
    return () => { active = false; };
  }, [page]);

  const rows = data?.results || [];

  return (
    <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "1.5rem", boxShadow: "0 4px 12px rgba(15,23,42,.07)" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .inv-row { transition: background .12s; border-radius: 8px; }
        .inv-row:hover { background: ${COLORS.faint}; }
      `}</style>

      <h3 style={{ margin: "0 0 1.25rem", fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: COLORS.primaryLight, color: COLORS.primaryDark }}>
          <BoxIcon />
        </span>
        Inventory status
      </h3>

      {status === "loading" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: "1.5rem" }}>
            {[0,1,2].map(i => <div key={i} style={{ background: COLORS.faint, borderRadius: 12, padding: "14px 16px" }}><Skeleton width="55%" height={11} style={{ marginBottom: 10 }} /><Skeleton width="60%" height={24} /></div>)}
          </div>
          {[0,1,2,3,4,5].map(i => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}`, gap: 12 }}>
              <div style={{ flex: 1 }}><Skeleton width="55%" height={13} style={{ marginBottom: 8 }} /><Skeleton width="40%" height={11} /></div>
              <Skeleton width={72} height={26} radius={20} />
            </div>
          ))}
        </>
      )}

      {status === "error" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: COLORS.danger, fontSize: 13, fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke={COLORS.danger} strokeWidth="1.5"/><path d="M8 4.5v4M8 10.5v1" stroke={COLORS.danger} strokeWidth="1.5" strokeLinecap="round"/></svg>
          Couldn't load inventory status.
        </div>
      )}

      {status === "ready" && data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: "1.5rem" }}>
            <SummaryStat label="Active products" value={data.product_count} delay={0} />
            <SummaryStat label="Low stock" value={data.low_stock_count} tone={data.low_stock_count > 0 ? COLORS.danger : COLORS.primary} delay={60} />
            <SummaryStat label="Total stock value" value={fmt(data.total_stock_value)} delay={120} />
          </div>

          {rows.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1rem", gap: 12, color: COLORS.muted }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="23" stroke={COLORS.border} strokeWidth="2"/><path d="M15 24h18M24 15v18" stroke={COLORS.border} strokeWidth="2" strokeLinecap="round"/></svg>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>No active products found.</p>
            </div>
          ) : (
            rows.map((p, i) => (
              <div
                key={p.id}
                className="inv-row"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "11px 8px",
                  borderBottom: i < rows.length - 1 ? `1px solid ${COLORS.border}` : "none",
                  gap: 12,
                  animation: "fadeUp .22s ease both",
                  animationDelay: `${i * 30}ms`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11.5, color: COLORS.muted }}>
                    SKU: {p.sku} · On hand: {num(p.quantity_on_hand)} · Value: {fmt(p.stock_value)}
                  </p>
                </div>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  background: p.is_low_stock ? "#fef2f2" : COLORS.primaryLight,
                  color: p.is_low_stock ? COLORS.danger : COLORS.primaryDark,
                  fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, whiteSpace: "nowrap",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.is_low_stock ? COLORS.danger : COLORS.primaryDark, display: "inline-block" }} />
                  {p.is_low_stock ? "Low stock" : "In stock"}
                </span>
              </div>
            ))
          )}

          {(data.next || data.previous) && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 12, borderTop: `1px solid ${COLORS.border}` }}>
              <span style={{ fontSize: 12, color: COLORS.muted }}>Page {page}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <PagerButton disabled={!data.previous} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Previous</PagerButton>
                <PagerButton disabled={!data.next} onClick={() => setPage((p) => p + 1)}>Next →</PagerButton>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
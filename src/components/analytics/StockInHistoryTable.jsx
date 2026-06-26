import { useState, useEffect } from "react";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { apiCalls } from "../../services/api";
import { ReceiptIcon } from "../icons/Icons";

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

const inputStyle = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "7px 11px",
  fontSize: 13,
  color: COLORS.text,
  background: COLORS.faint,
  fontFamily: "inherit",
  boxShadow: "0 1px 2px rgba(15,23,42,.04)",
};

function Skeleton({ width = "100%", height = 18, radius = 6, style = {} }) {
  return (
    <div style={{ width, height, borderRadius: radius, background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)", backgroundSize: "600px 100%", animation: "shimmer 1.4s infinite linear", ...style }} />
  );
}

export default function StockInHistoryTable() {
  const [start, setStart] = useState(daysAgoISO(29));
  const [end, setEnd] = useState(todayISO());
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    apiCalls
      .getStockInHistory({ start, end })
      .then((res) => { if (!active) return; setData(res.data); setStatus("ready"); })
      .catch(() => { if (!active) return; setStatus("error"); });
    return () => { active = false; };
  }, [start, end]);

  const rows = data?.results || [];

  return (
    <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "1.5rem", boxShadow: "0 4px 12px rgba(15,23,42,.07)" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .stock-row { transition: background .12s; border-radius: 8px; }
        .stock-row:hover { background: ${COLORS.faint}; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: "1.25rem" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: COLORS.primaryLight, color: COLORS.primaryDark }}>
            <ReceiptIcon />
          </span>
          Stock-in history
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
          <span style={{ color: COLORS.muted, fontSize: 13 }}>→</span>
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {status === "loading" && (
        <>
          <div style={{ background: COLORS.faint, borderRadius: 12, padding: "14px 16px", marginBottom: "1.25rem", display: "flex", gap: 16 }}>
            <Skeleton width={120} height={40} radius={8} />
            <Skeleton width={120} height={40} radius={8} />
          </div>
          {[0,1,2,3,4].map(i => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${COLORS.border}`, gap: 12 }}>
              <div style={{ flex: 1 }}><Skeleton width="45%" height={13} style={{ marginBottom: 8 }} /><Skeleton width="60%" height={11} /></div>
              <Skeleton width={80} height={16} radius={4} />
            </div>
          ))}
        </>
      )}

      {status === "error" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: COLORS.danger, fontSize: 13, fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke={COLORS.danger} strokeWidth="1.5"/><path d="M8 4.5v4M8 10.5v1" stroke={COLORS.danger} strokeWidth="1.5" strokeLinecap="round"/></svg>
          Couldn't load stock-in history.
        </div>
      )}

      {status === "ready" && data && (
        <>
          {/* Summary banner */}
          <div style={{ display: "flex", gap: 20, marginBottom: "1.25rem", padding: "12px 16px", background: COLORS.faint, borderRadius: 12, border: `1px solid ${COLORS.border}` }}>
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>Posted purchases</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: COLORS.text }}>{data.purchase_count}</p>
            </div>
            <div style={{ width: 1, background: COLORS.border }} />
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: COLORS.muted, textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 4 }}>Total cost</p>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: COLORS.primary }}>{fmt(data.total_purchase_cost)}</p>
            </div>
          </div>

          {rows.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "3rem 1rem", gap: 12, color: COLORS.muted }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="23" stroke={COLORS.border} strokeWidth="2"/><path d="M15 24h18M24 15v18" stroke={COLORS.border} strokeWidth="2" strokeLinecap="round"/></svg>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>No posted stock-in documents in this date range.</p>
            </div>
          ) : (
            rows.map((s, i) => (
              <div
                key={s.id}
                className="stock-row"
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
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.reference_no}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 11.5, color: COLORS.muted }}>
                    {s.supplier || "No supplier"} · {s.purchase_date} · {s.item_count} item(s)
                  </p>
                </div>
                <span style={{ fontWeight: 700, color: COLORS.primary, fontSize: 14, flexShrink: 0 }}>
                  {fmt(s.total_cost)}
                </span>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
import { useState, useEffect } from "react";
import Plot from "./PlotlyChart";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { apiCalls } from "../../services/api";
import { num } from "./numeric";
import { MoneyIcon } from "../icons/Icons";

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

function SummaryStat({ label, value, tone, delay = 0 }) {
  return (
    <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(15,23,42,.05)", animation: "fadeUp .28s ease both", animationDelay: `${delay}ms` }}>
      <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: COLORS.muted }}>{label}</p>
      <p style={{ margin: 0, fontSize: 21, fontWeight: 700, color: tone || COLORS.text, lineHeight: 1.15 }}>{value}</p>
    </div>
  );
}

export default function ProfitEstimateCard() {
  const [start, setStart] = useState(daysAgoISO(29));
  const [end, setEnd] = useState(todayISO());
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    apiCalls
      .getProfitEstimate({ start, end })
      .then((res) => { if (!active) return; setData(res.data); setStatus("ready"); })
      .catch(() => { if (!active) return; setStatus("error"); });
    return () => { active = false; };
  }, [start, end]);

  const profit = data ? num(data.estimated_profit) : 0;

  return (
    <div style={{ background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: "1.5rem", boxShadow: "0 4px 12px rgba(15,23,42,.07)" }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: "1.25rem" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: COLORS.primaryLight, color: COLORS.primaryDark }}>
            <MoneyIcon />
          </span>
          Profit estimate
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
          <span style={{ color: COLORS.muted, fontSize: 13 }}>→</span>
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {status === "loading" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: "1.5rem" }}>
            {[0,1,2].map(i => <div key={i} style={{ background: COLORS.faint, borderRadius: 12, padding: "14px 16px" }}><Skeleton width="55%" height={11} style={{ marginBottom: 10 }} /><Skeleton width="70%" height={24} /></div>)}
          </div>
          <Skeleton height={320} radius={12} />
        </>
      )}

      {status === "error" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: COLORS.danger, fontSize: 13, fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke={COLORS.danger} strokeWidth="1.5"/><path d="M8 4.5v4M8 10.5v1" stroke={COLORS.danger} strokeWidth="1.5" strokeLinecap="round"/></svg>
          Couldn't load the profit estimate.
        </div>
      )}

      {status === "ready" && data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: "1.5rem" }}>
            <SummaryStat label="Revenue" value={fmt(data.revenue)} delay={0} />
            <SummaryStat label="Estimated COGS" value={fmt(data.estimated_cogs)} tone={COLORS.accent} delay={60} />
            <SummaryStat label="Estimated profit" value={fmt(data.estimated_profit)} tone={profit >= 0 ? COLORS.primary : COLORS.danger} delay={120} />
          </div>

          <Plot
            data={[
              {
                type: "waterfall",
                x: ["Revenue", "COGS", "Estimated profit"],
                y: [num(data.revenue), -num(data.estimated_cogs), profit],
                measure: ["absolute", "relative", "total"],
                connector: { line: { color: COLORS.border, width: 1.5 } },
                decreasing: { marker: { color: COLORS.accent, opacity: 0.9 } },
                increasing: { marker: { color: COLORS.primary, opacity: 0.9 } },
                totals: { marker: { color: profit >= 0 ? COLORS.primary : COLORS.danger, opacity: 0.9 } },
                text: [data.revenue, data.estimated_cogs, data.estimated_profit].map((v) => fmt(v)),
                textposition: "outside",
                textfont: { size: 11, color: COLORS.text },
              },
            ]}
            layout={{
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              font: { family: "system-ui, -apple-system, sans-serif", color: COLORS.text, size: 12 },
              margin: { l: 60, r: 24, t: 24, b: 44 },
              xaxis: { gridcolor: COLORS.border, linecolor: COLORS.border, tickfont: { color: COLORS.muted }, zeroline: false },
              yaxis: { gridcolor: COLORS.border, linecolor: "transparent", tickfont: { color: COLORS.muted }, zeroline: false },
              showlegend: false,
              bargap: 0.5,
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "320px" }}
            useResizeHandler
          />

          <p style={{ fontSize: 12, color: COLORS.muted, margin: "14px 0 0", display: "flex", gap: 6, alignItems: "flex-start" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="7" cy="7" r="6.5" stroke={COLORS.muted} strokeWidth="1.2"/>
              <path d="M7 6v4M7 4.5v.5" stroke={COLORS.muted} strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            Estimate only — uses each product's current cost price, not audited margin accounting.
          </p>
        </>
      )}
    </div>
  );
}
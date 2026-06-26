import { useState, useEffect } from "react";
import Plot from "./PlotlyChart";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { apiCalls } from "../../services/api";
import { num } from "./numeric";
import { ReportIcon } from "../icons/Icons";

const todayISO = () => new Date().toISOString().slice(0, 10);

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
    <div
      style={{
        width, height, borderRadius: radius,
        background: "linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)",
        backgroundSize: "600px 100%",
        animation: "shimmer 1.4s infinite linear",
        ...style,
      }}
    />
  );
}

function SummaryStat({ label, value, tone, delay = 0 }) {
  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: "14px 16px",
        boxShadow: "0 1px 3px rgba(15,23,42,.05)",
        animation: "fadeUp .28s ease both",
        animationDelay: `${delay}ms`,
      }}
    >
      <p style={{ margin: "0 0 5px", fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: COLORS.muted }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: 21, fontWeight: 700, color: tone || COLORS.text, lineHeight: 1.15 }}>
        {value}
      </p>
    </div>
  );
}

export default function SalesSummaryChart() {
  const [period, setPeriod] = useState("daily");
  const [date, setDate] = useState(todayISO());
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [topItem, setTopItem] = useState(null);

  const isToday = period === "daily" && date === todayISO();

  useEffect(() => {
    let active = true;
    setStatus("loading");
    apiCalls
      .getSalesSummary({ period, date })
      .then((res) => { if (!active) return; setData(res.data); setStatus("ready"); })
      .catch(() => { if (!active) return; setStatus("error"); });
    return () => { active = false; };
  }, [period, date]);

  useEffect(() => {
    if (!isToday) { setTopItem(null); return; }
    let active = true;
    apiCalls
      .getDashboard()
      .then((res) => { if (!active) return; setTopItem(res.data?.top_item || null); })
      .catch(() => { if (!active) return; setTopItem(null); });
    return () => { active = false; };
  }, [isToday]);

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        padding: "1.5rem",
        boxShadow: "0 4px 12px rgba(15,23,42,.07)",
      }}
    >
      <style>{`
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .period-btn { transition: background .15s, color .15s, box-shadow .15s; }
        input[type="date"]:focus { outline: none; border-color: ${COLORS.primary} !important; box-shadow: 0 0 0 3px ${COLORS.primaryLight}; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: "1.25rem" }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: COLORS.text, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, borderRadius: 8, background: COLORS.primaryLight, color: COLORS.primaryDark }}>
            <ReportIcon />
          </span>
          Sales summary
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 2, background: COLORS.faint, borderRadius: 8, padding: 3, border: `1px solid ${COLORS.border}` }}>
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="period-btn"
                style={{
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 13px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  background: period === p ? COLORS.primary : "transparent",
                  color: period === p ? "#fff" : COLORS.muted,
                  boxShadow: period === p ? "0 1px 4px rgba(0,0,0,.15)" : "none",
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {/* Loading */}
      {status === "loading" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: "1.5rem" }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ background: COLORS.faint, borderRadius: 12, padding: "14px 16px" }}>
                <Skeleton width="55%" height={11} style={{ marginBottom: 10 }} />
                <Skeleton width="70%" height={24} />
              </div>
            ))}
          </div>
          <Skeleton height={300} radius={12} />
        </>
      )}

      {/* Error */}
      {status === "error" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12, color: COLORS.danger, fontSize: 13, fontWeight: 500 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.5" stroke={COLORS.danger} strokeWidth="1.5"/><path d="M8 4.5v4M8 10.5v1" stroke={COLORS.danger} strokeWidth="1.5" strokeLinecap="round"/></svg>
          Couldn't load the sales summary.
        </div>
      )}

      {/* Ready */}
      {status === "ready" && data && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10, marginBottom: "1.5rem" }}>
            <SummaryStat label="Gross sales" value={fmt(data.gross_sales)} delay={0} />
            <SummaryStat label="Transactions" value={data.transactions} delay={60} />
            <SummaryStat label="Discounts" value={fmt(data.total_discount)} delay={120} />
            <SummaryStat label="Net of tax" value={fmt(data.net_of_tax)} delay={180} />
            {isToday && (
              <SummaryStat label="Top item today" value={topItem ? topItem.name : "—"} tone={COLORS.accent} delay={240} />
            )}
          </div>

          <Plot
            data={[
              {
                type: "bar",
                x: ["Gross sales", "Discounts", "Tax", "Net of tax"],
                y: [num(data.gross_sales), num(data.total_discount), num(data.total_tax), num(data.net_of_tax)],
                marker: { color: [COLORS.primary, COLORS.accent, COLORS.warning, COLORS.info], opacity: 0.9 },
                text: [data.gross_sales, data.total_discount, data.total_tax, data.net_of_tax].map((v) => fmt(v)),
                textposition: "outside",
                textfont: { size: 11, color: COLORS.text },
                hovertemplate: "<b>%{x}</b><br>%{text}<extra></extra>",
              },
            ]}
            layout={{
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              font: { family: "system-ui, -apple-system, sans-serif", color: COLORS.text, size: 12 },
              margin: { l: 60, r: 16, t: 24, b: 44 },
              xaxis: { gridcolor: COLORS.border, linecolor: COLORS.border, tickfont: { color: COLORS.muted }, zeroline: false },
              yaxis: { gridcolor: COLORS.border, linecolor: "transparent", tickfont: { color: COLORS.muted }, zeroline: false },
              showlegend: false,
              bargap: 0.45,
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "300px" }}
            useResizeHandler
          />
        </>
      )}
    </div>
  );
}
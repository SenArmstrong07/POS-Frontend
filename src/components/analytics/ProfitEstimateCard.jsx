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
  padding: "6px 10px",
  fontSize: 13,
  color: COLORS.text,
  background: COLORS.faint,
  fontFamily: "inherit",
};

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
  }, [start, end]);

  const profit = data ? num(data.estimated_profit) : 0;

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 14,
        border: `1px solid ${COLORS.border}`,
        padding: "1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: "1rem",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: COLORS.text,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: COLORS.primary }}>
            <MoneyIcon />
          </span>{" "}
          Profit estimate
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
          <span style={{ color: COLORS.muted, fontSize: 13 }}>to</span>
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {status === "loading" && (
        <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Estimating profit…
        </p>
      )}
      {status === "error" && (
        <p style={{ color: COLORS.danger, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Couldn't load the profit estimate.
        </p>
      )}

      {status === "ready" && data && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: 12,
              marginBottom: "1.25rem",
            }}
          >
            <SummaryStat label="Revenue" value={fmt(data.revenue)} />
            <SummaryStat label="Estimated COGS" value={fmt(data.estimated_cogs)} tone={COLORS.accent} />
            <SummaryStat
              label="Estimated profit"
              value={fmt(data.estimated_profit)}
              tone={profit >= 0 ? COLORS.primary : COLORS.danger}
            />
          </div>

          <Plot
            data={[
              {
                type: "waterfall",
                x: ["Revenue", "COGS", "Estimated profit"],
                y: [num(data.revenue), -num(data.estimated_cogs), profit],
                measure: ["absolute", "relative", "total"],
                connector: { line: { color: COLORS.border } },
                decreasing: { marker: { color: COLORS.accent } },
                increasing: { marker: { color: COLORS.primary } },
                totals: { marker: { color: profit >= 0 ? COLORS.primary : COLORS.danger } },
                text: [data.revenue, data.estimated_cogs, data.estimated_profit].map((v) => fmt(v)),
                textposition: "outside",
              },
            ]}
            layout={{
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              font: { family: "system-ui, -apple-system, sans-serif", color: COLORS.text, size: 12 },
              margin: { l: 56, r: 16, t: 16, b: 40 },
              xaxis: { gridcolor: COLORS.border, linecolor: COLORS.border, tickfont: { color: COLORS.muted } },
              yaxis: { gridcolor: COLORS.border, linecolor: COLORS.border, tickfont: { color: COLORS.muted } },
              showlegend: false,
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "320px" }}
            useResizeHandler
          />

          <p style={{ fontSize: 12, color: COLORS.muted, margin: "12px 0 0" }}>
            Estimate only — uses each product's current cost price, not audited margin accounting.
          </p>
        </>
      )}
    </div>
  );
}

function SummaryStat({ label, value, tone }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: tone || COLORS.text }}>{value}</p>
    </div>
  );
}
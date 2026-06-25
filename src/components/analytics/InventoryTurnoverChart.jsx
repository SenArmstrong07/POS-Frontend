import { useState, useEffect } from "react";
import Plot from "./PlotlyChart";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { apiCalls } from "../../services/api";
import { num } from "./numeric";
import { ReportIcon } from "../icons/Icons";

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

export default function InventoryTurnoverChart() {
  const [start, setStart] = useState(daysAgoISO(29));
  const [end, setEnd] = useState(todayISO());
  const [limit, setLimit] = useState(15);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    apiCalls
      .getInventoryTurnover({ start, end, limit })
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
  }, [start, end, limit]);

  const rows = data?.results || [];
  const charted = [...rows].filter((r) => r.turnover_rate !== null).reverse();

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
            <ReportIcon />
          </span>{" "}
          Inventory turnover
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
          <span style={{ color: COLORS.muted, fontSize: 13 }}>to</span>
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={inputStyle}>
            {[10, 15, 25, 50].map((n) => (
              <option key={n} value={n}>
                Top {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status === "loading" && (
        <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Calculating turnover…
        </p>
      )}
      {status === "error" && (
        <p style={{ color: COLORS.danger, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Couldn't load inventory turnover.
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
            <SummaryStat label="Total COGS" value={fmt(data.summary.total_cogs)} tone={COLORS.accent} />
            <SummaryStat label="Avg inventory value" value={fmt(data.summary.total_avg_inventory_value)} />
            <SummaryStat
              label="Overall turnover"
              value={
                data.summary.overall_turnover_rate !== null
                  ? `${data.summary.overall_turnover_rate.toFixed(2)}x`
                  : "—"
              }
            />
          </div>

          {rows.length === 0 ? (
            <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
              No active products to evaluate for this period.
            </p>
          ) : (
            <>
              {charted.length > 0 && (
                <Plot
                  data={[
                    {
                      type: "bar",
                      orientation: "h",
                      x: charted.map((r) => r.turnover_rate),
                      y: charted.map((r) => r.name),
                      marker: { color: COLORS.primary },
                      hovertemplate: "%{y}<br>Turnover: %{x:.2f}x<extra></extra>",
                    },
                  ]}
                  layout={{
                    paper_bgcolor: "transparent",
                    plot_bgcolor: "transparent",
                    font: { family: "system-ui, -apple-system, sans-serif", color: COLORS.text, size: 12 },
                    margin: { l: 150, r: 16, t: 8, b: 40 },
                    xaxis: { gridcolor: COLORS.border, linecolor: COLORS.border, tickfont: { color: COLORS.muted } },
                    yaxis: { gridcolor: COLORS.border, linecolor: COLORS.border, tickfont: { color: COLORS.muted } },
                  }}
                  config={{ displayModeBar: false, responsive: true }}
                  style={{ width: "100%", height: `${Math.max(220, charted.length * 36)}px` }}
                  useResizeHandler
                />
              )}

              <div style={{ marginTop: 12 }}>
                {rows.map((r) => (
                  <div
                    key={r.product}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 0",
                      borderBottom: `1px solid ${COLORS.faint}`,
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLORS.text }}>{r.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>
                        SKU: {r.sku} · {num(r.units_sold)} sold · COGS {fmt(r.cogs)}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                        {r.turnover_rate !== null ? `${r.turnover_rate.toFixed(2)}x` : "—"}
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>
                        {r.days_to_sell !== null ? `${r.days_to_sell}d to sell` : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
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
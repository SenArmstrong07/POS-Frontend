import { useState, useEffect } from "react";
import Plot from "./PlotlyChart";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { apiCalls } from "../../services/api";
import { num } from "./numeric";
import { CartIcon } from "../icons/Icons";

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

export default function TopProductsChart() {
  const [start, setStart] = useState(daysAgoISO(29));
  const [end, setEnd] = useState(todayISO());
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    apiCalls
      .getTopProducts({ start, end, limit })
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
            <CartIcon />
          </span>{" "}
          Top products
        </h3>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
          <span style={{ color: COLORS.muted, fontSize: 13 }}>to</span>
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={inputStyle}>
            {[5, 10, 20, 50].map((n) => (
              <option key={n} value={n}>
                Top {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      {status === "loading" && (
        <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Loading top products…
        </p>
      )}
      {status === "error" && (
        <p style={{ color: COLORS.danger, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Couldn't load top products.
        </p>
      )}
      {status === "ready" && rows.length === 0 && (
        <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          No sales recorded in this date range.
        </p>
      )}

      {status === "ready" && rows.length > 0 && (
        <>
          <Plot
            data={[
              {
                type: "scatter",
                mode: "lines+markers",
                x: rows.map((r) => r.product__name),
                y: rows.map((r) => num(r.quantity_sold)),
                line: { color: COLORS.primary, width: 2, shape: "spline" },
                marker: { color: COLORS.primary, size: 7 },
                hovertemplate: "%{x}<br>Qty sold: %{y}<extra></extra>",
              },
            ]}
            layout={{
              paper_bgcolor: "transparent",
              plot_bgcolor: "transparent",
              font: { family: "system-ui, -apple-system, sans-serif", color: COLORS.text, size: 12 },
              margin: { l: 48, r: 16, t: 8, b: 90 },
              xaxis: {
                gridcolor: COLORS.border,
                linecolor: COLORS.border,
                tickfont: { color: COLORS.muted },
                tickangle: -35,
              },
              yaxis: {
                gridcolor: COLORS.border,
                linecolor: COLORS.border,
                tickfont: { color: COLORS.muted },
                title: { text: "Quantity sold" },
              },
            }}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: "100%", height: "320px" }}
            useResizeHandler
          />

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
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLORS.text }}>
                    {r.product__name}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>SKU: {r.product__sku}</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.primary }}>
                    {fmt(r.revenue)}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>
                    {num(r.quantity_sold)} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
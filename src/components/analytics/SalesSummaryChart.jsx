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
  padding: "6px 10px",
  fontSize: 13,
  color: COLORS.text,
  background: COLORS.faint,
  fontFamily: "inherit",
};

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
  }, [period, date]);

  // The dashboard endpoint is the only one that returns "top item" — and it's
  // always relative to today, so only fetch/show it when the selected range
  // actually is today. Otherwise it'd misleadingly label a stale top-seller
  // while the rest of the card shows a different period.
  useEffect(() => {
    if (!isToday) {
      setTopItem(null);
      return;
    }
    let active = true;
    apiCalls
      .getDashboard()
      .then((res) => {
        if (!active) return;
        setTopItem(res.data?.top_item || null);
      })
      .catch(() => {
        if (!active) return;
        setTopItem(null);
      });
    return () => {
      active = false;
    };
  }, [isToday]);

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
          Sales summary
        </h3>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 2, background: COLORS.faint, borderRadius: 8, padding: 3 }}>
            {["daily", "weekly", "monthly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  border: "none",
                  borderRadius: 6,
                  padding: "6px 12px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  background: period === p ? COLORS.primary : "transparent",
                  color: period === p ? "#fff" : COLORS.muted,
                }}
              >
                {p}
              </button>
            ))}
          </div>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {status === "loading" && (
        <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Loading sales summary…
        </p>
      )}
      {status === "error" && (
        <p style={{ color: COLORS.danger, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Couldn't load the sales summary.
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
            <SummaryStat label="Gross sales" value={fmt(data.gross_sales)} />
            <SummaryStat label="Transactions" value={data.transactions} />
            <SummaryStat label="Discounts" value={fmt(data.total_discount)} />
            <SummaryStat label="Net of tax" value={fmt(data.net_of_tax)} />
            {isToday && (
              <SummaryStat
                label="Top item today"
                value={topItem ? topItem.name : "—"}
                tone={COLORS.accent}
              />
            )}
          </div>

          <Plot
            data={[
              {
                type: "bar",
                x: ["Gross sales", "Discounts", "Tax", "Net of tax"],
                y: [
                  num(data.gross_sales),
                  num(data.total_discount),
                  num(data.total_tax),
                  num(data.net_of_tax),
                ],
                marker: { color: [COLORS.primary, COLORS.accent, COLORS.warning, COLORS.info] },
                text: [data.gross_sales, data.total_discount, data.total_tax, data.net_of_tax].map((v) =>
                  fmt(v)
                ),
                textposition: "outside",
                hovertemplate: "%{x}: %{text}<extra></extra>",
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
            style={{ width: "100%", height: "300px" }}
            useResizeHandler
          />
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
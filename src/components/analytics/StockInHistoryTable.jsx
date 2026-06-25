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
  padding: "6px 10px",
  fontSize: 13,
  color: COLORS.text,
  background: COLORS.faint,
  fontFamily: "inherit",
};

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
            <ReceiptIcon />
          </span>{" "}
          Stock-in history
        </h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="date" value={start} max={end} onChange={(e) => setStart(e.target.value)} style={inputStyle} />
          <span style={{ color: COLORS.muted, fontSize: 13 }}>to</span>
          <input type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} style={inputStyle} />
        </div>
      </div>

      {status === "loading" && (
        <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Loading stock-in history…
        </p>
      )}
      {status === "error" && (
        <p style={{ color: COLORS.danger, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Couldn't load stock-in history.
        </p>
      )}

      {status === "ready" && data && (
        <>
          <p style={{ margin: "0 0 1rem", fontSize: 13, color: COLORS.muted }}>
            <strong style={{ color: COLORS.text }}>{data.purchase_count}</strong> posted purchases · Total cost:{" "}
            <strong style={{ color: COLORS.text }}>{fmt(data.total_purchase_cost)}</strong>
          </p>

          {rows.length === 0 ? (
            <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
              No posted stock-in documents in this date range.
            </p>
          ) : (
            rows.map((s) => (
              <div
                key={s.id}
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
                    {s.reference_no}
                  </p>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>
                    {s.supplier || "No supplier"} · {s.purchase_date} · {s.item_count} item(s)
                  </p>
                </div>
                <span style={{ fontWeight: 600, color: COLORS.primary, fontSize: 14 }}>
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
import { useState, useEffect } from "react";
import { COLORS } from "../../constants/colors";
import { num } from "./numeric";
import { apiCalls } from "../../services/api";
import { AlertIcon } from "../icons/Icons";

const inputStyle = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  padding: "6px 8px",
  fontSize: 13,
  color: COLORS.text,
  background: COLORS.faint,
  width: 64,
  fontFamily: "inherit",
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  color: COLORS.muted,
  display: "block",
  marginBottom: 4,
};

export default function ReorderPointTable() {
  const [params, setParams] = useState({
    days: 30,
    lead_time_days: 7,
    safety_factor: 0.5,
    low_stock_only: false,
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    apiCalls
      .getReorderPoint({ ...params, page })
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
  }, [params, page]);

  const rows = data?.results || [];

  const updateParam = (key, value) => {
    setPage(1);
    setParams((p) => ({ ...p, [key]: value }));
  };

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
          alignItems: "flex-start",
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
          <span style={{ color: COLORS.danger }}>
            <AlertIcon />
          </span>{" "}
          Reorder point suggestions
        </h3>

        <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
          <div>
            <label style={labelStyle}>Lookback (d)</label>
            <input
              type="number"
              min={1}
              value={params.days}
              onChange={(e) => updateParam("days", Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Lead time (d)</label>
            <input
              type="number"
              min={1}
              value={params.lead_time_days}
              onChange={(e) => updateParam("lead_time_days", Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Safety factor</label>
            <input
              type="number"
              min={0}
              step={0.1}
              value={params.safety_factor}
              onChange={(e) => updateParam("safety_factor", Number(e.target.value))}
              style={inputStyle}
            />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: COLORS.text, paddingBottom: 6, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={params.low_stock_only}
              onChange={(e) => updateParam("low_stock_only", e.target.checked)}
            />
            Needs reorder only
          </label>
        </div>
      </div>

      {status === "loading" && (
        <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Calculating reorder points…
        </p>
      )}
      {status === "error" && (
        <p style={{ color: COLORS.danger, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Couldn't load reorder point suggestions.
        </p>
      )}

      {status === "ready" && data && (
        <>
          <p style={{ margin: "0 0 1rem", fontSize: 13, color: COLORS.muted }}>
            <strong style={{ color: data.needs_reorder_count > 0 ? COLORS.danger : COLORS.primary }}>
              {data.needs_reorder_count}
            </strong>{" "}
            product(s) need reordering
          </p>

          {rows.length === 0 ? (
            <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
              No products match these filters.
            </p>
          ) : (
            rows.map((r) => (
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
                    SKU: {r.sku} · On hand: {num(r.quantity_on_hand)} · Suggested order:{" "}
                    {num(r.suggested_reorder_qty).toFixed(0)}
                  </p>
                </div>
                <span
                  style={{
                    background: r.needs_reorder ? "#fef2f2" : COLORS.primaryLight,
                    color: r.needs_reorder ? COLORS.danger : COLORS.primary,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 6,
                  }}
                >
                  {r.needs_reorder ? "Reorder now" : "OK"}
                </span>
              </div>
            ))
          )}

          {(data.next || data.previous) && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
              <PagerButton disabled={!data.previous} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Previous
              </PagerButton>
              <PagerButton disabled={!data.next} onClick={() => setPage((p) => p + 1)}>
                Next
              </PagerButton>
            </div>
          )}
        </>
      )}
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
        background: disabled ? COLORS.faint : COLORS.card,
        color: disabled ? COLORS.muted : COLORS.text,
        borderRadius: 8,
        padding: "6px 14px",
        fontSize: 13,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {children}
    </button>
  );
}
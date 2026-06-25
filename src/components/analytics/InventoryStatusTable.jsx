import { useState, useEffect } from "react";
import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { apiCalls } from "../../services/api";
import { num } from "./numeric";
import { BoxIcon } from "../icons/Icons";

export default function InventoryStatusTable() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    apiCalls
      .getInventoryStatus({ page })
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
  }, [page]);

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
      <h3
        style={{
          margin: "0 0 1rem",
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span style={{ color: COLORS.primary }}>
          <BoxIcon />
        </span>{" "}
        Inventory status
      </h3>

      {status === "loading" && (
        <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Loading inventory status…
        </p>
      )}
      {status === "error" && (
        <p style={{ color: COLORS.danger, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          Couldn't load inventory status.
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
            <SummaryStat label="Active products" value={data.product_count} />
            <SummaryStat
              label="Low stock"
              value={data.low_stock_count}
              tone={data.low_stock_count > 0 ? COLORS.danger : COLORS.primary}
            />
            <SummaryStat label="Total stock value" value={fmt(data.total_stock_value)} />
          </div>

          {rows.length === 0 ? (
            <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
              No active products found.
            </p>
          ) : (
            rows.map((p) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: `1px solid ${COLORS.faint}`,
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLORS.text }}>{p.name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>
                    SKU: {p.sku} · On hand: {num(p.quantity_on_hand)} · Value: {fmt(p.stock_value)}
                  </p>
                </div>
                <span
                  style={{
                    background: p.is_low_stock ? "#fef2f2" : COLORS.primaryLight,
                    color: p.is_low_stock ? COLORS.danger : COLORS.primary,
                    fontSize: 12,
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: 6,
                  }}
                >
                  {p.is_low_stock ? "Low stock" : "OK"}
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

function SummaryStat({ label, value, tone }) {
  return (
    <div>
      <p style={{ margin: 0, fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: tone || COLORS.text }}>{value}</p>
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
import { COLORS } from "../../constants/colors";

export default function ActivityLogModal({ show, onClose, logs, loading = false, onRefreshLogs }) {
  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.card,
          borderRadius: 16,
          border: "1px solid " + COLORS.border,
          width: "100%",
          maxWidth: 540,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid " + COLORS.border,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.text }}>Activity Log</h3>
            {logs.length > 0 && (
              <span
                style={{
                  background: COLORS.primaryLight,
                  color: COLORS.primaryDark,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 6,
                }}
              >
                {logs.length}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={onRefreshLogs}
              disabled={loading}
              style={{
                padding: "6px 12px",
                border: "1px solid " + COLORS.border,
                borderRadius: 6,
                background: COLORS.faint,
                color: COLORS.muted,
                fontSize: 12,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                border: "none",
                borderRadius: 8,
                background: COLORS.faint,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                color: COLORS.muted,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: COLORS.faint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={COLORS.muted}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: COLORS.text }}>No activity yet</p>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: COLORS.muted }}>
                Add products or adjust stock to see history here.
              </p>
            </div>
          ) : (
            logs.map((log, idx) => {
              const actionLabel = {
                STOCK_IN: "Stock in",
                SALE: "Sale",
                SALE_REVERSAL: "Sale reversal",
                ADJUSTMENT: "Manual adjustment",
                OPENING: "Opening balance",
              }[log.movement_type] || log.action || "Activity";
              const quantity = Number(log.quantity ?? log.qty ?? 0);
              const isNegative = quantity < 0;
              const productName = log.product_name || log.productName || "Unknown product";
              const sku = log.product_sku || log.sku || "N/A";
              const time = log.created_at
                ? new Date(log.created_at).toLocaleString("en-PH")
                : log.time;

              return (
              <div
                key={log.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: idx < logs.length - 1 ? "1px solid " + COLORS.faint : "none",
                  gap: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background:
                        log.action === "Added product"
                          || log.movement_type === "OPENING"
                          ? "#e9f9f0"
                          : log.action === "Bulk import" || log.movement_type === "STOCK_IN"
                          ? "#e6f1fb"
                          : log.action === "Stock added" || quantity > 0
                          ? COLORS.primaryLight
                          : "#fef2f2",
                      color:
                        log.action === "Added product"
                          || log.movement_type === "OPENING"
                          ? COLORS.success
                          : log.action === "Bulk import" || log.movement_type === "STOCK_IN"
                          ? COLORS.info
                          : log.action === "Stock added" || quantity > 0
                          ? COLORS.primary
                          : COLORS.danger,
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                  >
                      {log.action === "Added product"
                      || log.movement_type === "OPENING"
                      ? "+"
                      : log.action === "Bulk import" || log.movement_type === "STOCK_IN"
                      ? "↑"
                      : log.action === "Stock added" || quantity > 0
                      ? "↑"
                      : "↓"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 500,
                        color: COLORS.text,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {actionLabel}: <strong>{productName}</strong>
                    </p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>
                      SKU: {sku} · {time}
                      {log.reason ? ` · ${log.reason}` : ""}
                    </p>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: isNegative ? COLORS.danger : COLORS.primary,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {isNegative ? "" : "+"}
                  {quantity} units
                </span>
              </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

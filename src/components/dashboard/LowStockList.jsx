import { COLORS } from "../../constants/colors";
import { AlertIcon } from "../icons/Icons";

export default function LowStockList({ products }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: "1.25rem" }}>
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
        <span style={{ color: COLORS.danger }}>
          <AlertIcon />
        </span>{" "}
        Low stock alerts
      </h3>
      {products.length === 0 ? (
        <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
          All products are well-stocked ✓
        </p>
      ) : (
        products.map((p) => (
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
              <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>SKU: {p.sku || p.barcode || 'N/A'}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  background: (p.stock || p.quantity_on_hand || 0) === 0 ? "#fef2f2" : "#faeeda",
                  color: (p.stock || p.quantity_on_hand || 0) === 0 ? COLORS.danger : COLORS.warning,
                  fontSize: 12,
                  fontWeight: 600,
                  padding: "3px 10px",
                  borderRadius: 6,
                }}
              >
                {(p.stock || p.quantity_on_hand || 0)} left
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
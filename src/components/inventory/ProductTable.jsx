import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

export default function ProductTable({ products, onAdjust }) {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 14,
        border: "1px solid " + COLORS.border,
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
          <thead>
            <tr style={{ background: COLORS.faint }}>
              {["Product name", "SKU", "Category", "Price", "Cost", "Stock", "Reorder", "Status"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 12, fontWeight: 600, color: COLORS.muted }}>
                  {h}
                </th>
              ))}
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: 12, fontWeight: 600, color: COLORS.muted }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
              <tr
                key={p.id}
                style={{ borderTop: "1px solid " + COLORS.faint, background: i % 2 === 0 ? "#fff" : COLORS.faint }}
              >
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 500, color: COLORS.text }}>{p.name}</td>
                <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.muted, fontFamily: "monospace" }}>{p.sku}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      padding: "3px 10px",
                      borderRadius: 6,
                      background: COLORS.faint,
                      color: COLORS.muted,
                    }}
                  >
                    {p.category || "General"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: COLORS.primary }}>{fmt(p.price)}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: COLORS.text }}>{fmt(p.cost)}</td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: p.stock <= p.reorder ? COLORS.danger : COLORS.text,
                  }}
                >
                  {p.stock}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: COLORS.muted }}>{p.reorder}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 6,
                      background: p.stock === 0 ? "#fef2f2" : p.stock <= p.reorder ? "#faeeda" : "#e9f9f0",
                      color: p.stock === 0 ? COLORS.danger : p.stock <= p.reorder ? COLORS.warning : COLORS.success,
                    }}
                  >
                    {p.stock === 0 ? "Out of stock" : p.stock <= p.reorder ? "Low stock" : "In stock"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                    <button
                      onClick={() => onAdjust(p, "add")}
                      title="Add stock"
                      style={{
                        width: 30,
                        height: 30,
                        border: "1px solid " + COLORS.border,
                        borderRadius: 6,
                        background: "#e9f9f0",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        color: COLORS.success,
                      }}
                    >
                      +
                    </button>
                    <button
                      onClick={() => onAdjust(p, "remove")}
                      title="Remove stock"
                      disabled={p.stock === 0}
                      style={{
                        width: 30,
                        height: 30,
                        border: "1px solid " + COLORS.border,
                        borderRadius: 6,
                        background: p.stock === 0 ? COLORS.faint : "#fef2f2",
                        cursor: p.stock === 0 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 16,
                        fontWeight: 700,
                        color: p.stock === 0 ? COLORS.muted : COLORS.danger,
                        opacity: p.stock === 0 ? 0.5 : 1,
                      }}
                    >
                      −
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: "2rem", textAlign: "center", color: COLORS.muted }}>
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
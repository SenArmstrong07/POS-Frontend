import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

// Helper to parse price from different field names
const getPrice = (product, field = 'price') => {
  if (field === 'price') {
    const price = product.price || product.unit_price || product.selling_price || product.price_per_unit || 0;
    return parseFloat(price) || 0;
  } else if (field === 'cost') {
    const cost = product.cost || product.cost_price || product.unit_cost || 0;
    return parseFloat(cost) || 0;
  }
  return 0;
};

const getStock = (product) => {
  return product.stock || product.quantity_on_hand || 0;
};

const getReorderLevel = (product) => {
  return product.reorder || product.reorder_level || 5;
};

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
                <td style={{ padding: "12px 16px", fontSize: 13, color: COLORS.muted, fontFamily: "monospace" }}>{p.sku || 'N/A'}</td>
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
                    {p.category || p.cat_id || "General"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 600, color: COLORS.primary }}>{fmt(getPrice(p, 'price'))}</td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: COLORS.text }}>{fmt(getPrice(p, 'cost'))}</td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                    color: getStock(p) <= getReorderLevel(p) ? COLORS.danger : COLORS.text,
                  }}
                >
                  {getStock(p)}
                </td>
                <td style={{ padding: "12px 16px", fontSize: 14, color: COLORS.muted }}>{getReorderLevel(p)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 6,
                      background: getStock(p) === 0 ? "#fef2f2" : getStock(p) <= getReorderLevel(p) ? "#faeeda" : "#e9f9f0",
                      color: getStock(p) === 0 ? COLORS.danger : getStock(p) <= getReorderLevel(p) ? COLORS.warning : COLORS.success,
                    }}
                  >
                    {getStock(p) === 0 ? "Out of stock" : getStock(p) <= getReorderLevel(p) ? "Low stock" : "In stock"}
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
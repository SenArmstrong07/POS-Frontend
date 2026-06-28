import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { getProductPrice, getProductReorderLevel, getProductStock } from "../../utils/productFields";

export default function ProductGrid({ search, setSearch, products, cart, onAddToCart }) {
  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ position: "relative" }}>
          <svg
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.muted }}
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name or SKU…"
            style={{
              width: "100%",
              padding: "12px 12px 12px 40px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 10,
              fontSize: 14,
              background: COLORS.card,
              boxSizing: "border-box",
              color: COLORS.text,
            }}
          />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12 }}>
        {(products || []).map((p) => {
          const inCart = cart.find((i) => i.id === p.id);
          const stock = getProductStock(p);
          const price = getProductPrice(p);
          const reorderLevel = getProductReorderLevel(p);
          return (
            <button
              key={p.id}
              onClick={() => onAddToCart(p)}
              disabled={stock === 0 || price <= 0}
              style={{
                background: COLORS.card,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 12,
                padding: "1rem",
                cursor: stock === 0 || price <= 0 ? "not-allowed" : "pointer",
                textAlign: "left",
                opacity: stock === 0 || price <= 0 ? 0.5 : 1,
                transition: "border-color 0.15s",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: COLORS.muted,
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {p.sku}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.text, marginBottom: 6, lineHeight: 1.3 }}>
                {p.name}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.primary }}>{fmt(price)}</div>
              <div style={{ fontSize: 11, color: stock <= reorderLevel ? COLORS.danger : COLORS.muted, marginTop: 4 }}>
                Stock: {stock}
              </div>
              {inCart && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 20,
                    height: 20,
                    background: COLORS.primary,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {inCart.qty}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

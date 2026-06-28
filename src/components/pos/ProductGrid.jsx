import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { getProductPrice, getProductReorderLevel, getProductStock } from "../../utils/productFields";

export default function ProductGrid({ search, setSearch, products, cart, onAddToCart, lastAddedProductId, disabled = false }) {
  return (
    <div>
      <style>{`
        @keyframes productAddedPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(29,158,117,.34); }
          45% { transform: scale(1.025); box-shadow: 0 0 0 8px rgba(29,158,117,.12); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(29,158,117,0); }
        }
        @keyframes productRipple {
          0% { transform: scale(.2); opacity: .38; }
          100% { transform: scale(2.8); opacity: 0; }
        }
        .product-card { box-shadow: 0 1px 3px rgba(15,23,42,.05); }
        .product-card:hover:not(:disabled) {
          transform: translateY(-2px);
          border-color: ${COLORS.primary};
          box-shadow: 0 10px 22px rgba(15,23,42,.10);
        }
        .product-card:active:not(:disabled) { transform: translateY(0) scale(.985); }
        .product-card.added { animation: productAddedPulse .58s ease-out; border-color: ${COLORS.primary}; }
        .product-card.added::after {
          content: "";
          position: absolute;
          width: 90px;
          height: 90px;
          right: -24px;
          bottom: -24px;
          border-radius: 999px;
          background: ${COLORS.primary};
          animation: productRipple .58s ease-out;
          pointer-events: none;
        }
        .product-search:focus {
          border-color: ${COLORS.primary} !important;
          box-shadow: 0 0 0 3px ${COLORS.primaryLight};
        }
      `}</style>
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
            className="product-search"
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
              outline: "none",
              boxShadow: "0 1px 3px rgba(15,23,42,.05)",
            }}
          />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(165px,1fr))", gap: 12 }}>
        {(products || []).map((p) => {
          const inCart = cart.find((i) => i.id === p.id);
          const stock = getProductStock(p);
          const price = getProductPrice(p);
          const reorderLevel = getProductReorderLevel(p);
          const unavailable = disabled || stock === 0 || price <= 0;
          const isLowStock = stock > 0 && stock <= reorderLevel;
          const isAdded = lastAddedProductId === p.id;
          return (
            <button
              key={p.id}
              className={`product-card${isAdded ? " added" : ""}`}
              onClick={() => onAddToCart(p)}
              disabled={unavailable}
              style={{
                background: inCart ? "linear-gradient(180deg,#fff 0%,#f7fffb 100%)" : COLORS.card,
                border: `1px solid ${inCart ? COLORS.primary : COLORS.border}`,
                borderRadius: 14,
                padding: "14px",
                cursor: unavailable ? "not-allowed" : "pointer",
                textAlign: "left",
                opacity: unavailable ? 0.58 : 1,
                transition: "transform .16s ease, border-color .16s ease, box-shadow .16s ease, background .16s ease",
                position: "relative",
                overflow: "hidden",
                minHeight: 148,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span
                  style={{
                    fontSize: 10,
                    color: COLORS.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    background: COLORS.faint,
                    padding: "4px 7px",
                    borderRadius: 999,
                    fontWeight: 700,
                    maxWidth: "70%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.sku || "No SKU"}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    color: stock === 0 ? COLORS.danger : isLowStock ? COLORS.warning : COLORS.primaryDark,
                    background: stock === 0 ? "#fef2f2" : isLowStock ? "#faeeda" : COLORS.primaryLight,
                    padding: "4px 7px",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                  }}
                >
                  {stock === 0 ? "Out" : `${stock} left`}
                </span>
              </div>

              <div style={{ margin: "12px 0" }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.text,
                    marginBottom: 7,
                    lineHeight: 1.28,
                    minHeight: 36,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 17, fontWeight: 800, color: COLORS.primary }}>{fmt(price)}</div>
                {price <= 0 && (
                  <div style={{ fontSize: 11, color: COLORS.danger, fontWeight: 700, marginTop: 5 }}>
                    No sellable price
                  </div>
                )}
              </div>

              <div
                style={{
                  borderTop: `1px solid ${COLORS.faint}`,
                  paddingTop: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: inCart ? COLORS.primaryDark : COLORS.muted,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span>{inCart ? "Added to cart" : "Tap to add"}</span>
                <span style={{ fontSize: 16, lineHeight: 1 }}>{inCart ? "✓" : "+"}</span>
              </div>

              {inCart && (
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    width: 24,
                    height: 24,
                    background: COLORS.primary,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 800,
                    boxShadow: "0 6px 14px rgba(29,158,117,.25)",
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

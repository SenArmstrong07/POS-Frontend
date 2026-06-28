import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";
import { CartIcon } from "../icons/Icons";

export default function CartPanel({ cart, subtotal, onUpdateQty, onRequestVoid, disabled = false }) {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        minHeight: 400,
      }}
    >
      <style>{`
        @keyframes cartRowIn { from { opacity: 0; transform: translateX(8px); } to { opacity: 1; transform: translateX(0); } }
        .cart-row { transition: background .14s ease, transform .14s ease; animation: cartRowIn .22s ease both; }
        .cart-row:hover { background: ${COLORS.faint}; transform: translateX(2px); }
        .cart-qty-btn { transition: border-color .14s ease, color .14s ease, background .14s ease; }
        .cart-qty-btn:hover:not(:disabled) { border-color: ${COLORS.primary}; color: ${COLORS.primaryDark}; background: ${COLORS.primaryLight}; }
      `}</style>
      <h3 style={{ margin: "0 0 1rem", fontSize: 15, fontWeight: 600, color: COLORS.text }}>
        Current sale{" "}
        {cart.length > 0 && (
          <span
            style={{
              background: COLORS.primary,
              color: "#fff",
              fontSize: 11,
              borderRadius: 6,
              padding: "2px 8px",
              marginLeft: 6,
            }}
          >
            {cart.length}
          </span>
        )}
      </h3>

      {cart.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: COLORS.muted,
            textAlign: "center",
          }}
        >
          <div>
            <CartIcon />
            <p style={{ marginTop: 8, fontSize: 14 }}>Select products to add to cart</p>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: "auto" }}>
          {(cart || []).map((i) => (
            <div
              key={i.id}
              className="cart-row"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 8px",
                borderBottom: `1px solid ${COLORS.faint}`,
                borderRadius: 10,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
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
                  {i.name}
                </p>
                <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>{fmt(i.price)} each</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  className="cart-qty-btn"
                  onClick={() => onUpdateQty(i.id, -1)}
                  disabled={disabled}
                  style={{
                    width: 26,
                    height: 26,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 6,
                    background: "#fff",
                    cursor: disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: COLORS.text,
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{i.qty}</span>
                <button
                  className="cart-qty-btn"
                  onClick={() => onUpdateQty(i.id, 1)}
                  disabled={disabled}
                  style={{
                    width: 26,
                    height: 26,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 6,
                    background: "#fff",
                    cursor: disabled ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    color: COLORS.text,
                  }}
                >
                  +
                </button>
              </div>
              <span style={{ fontWeight: 600, fontSize: 14, color: COLORS.text, minWidth: 70, textAlign: "right" }}>
                {fmt(i.price * i.qty)}
              </span>
              <button
                onClick={() => onRequestVoid(i)}
                disabled={disabled}
                title="Void item"
                style={{
                  width: 28,
                  height: 28,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 6,
                  background: "#fff",
                  color: COLORS.danger,
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontSize: 17,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: "1rem", marginTop: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            fontSize: 18,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          <span>Total</span>
          <span style={{ color: COLORS.primary }}>{fmt(subtotal)}</span>
        </div>
      </div>
    </div>
  );
}

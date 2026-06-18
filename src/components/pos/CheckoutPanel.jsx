import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

export default function CheckoutPanel({
  cart,
  subtotal,
  payment,
  setPayment,
  tendered,
  setTendered,
  change,
  onCheckout,
}) {
  const canCharge =
    cart.length > 0 && (payment !== "Cash" || (parseFloat(tendered) || 0) >= subtotal);

  return (
    <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: "1rem" }}>
      {/* Payment method */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500, display: "block", marginBottom: 6 }}>
          Payment method
        </label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Cash", "Card", "GCash", "Maya"].map((m) => (
            <button
              key={m}
              onClick={() => setPayment(m)}
              style={{
                padding: "6px 12px",
                border: `1.5px solid ${payment === m ? COLORS.primary : COLORS.border}`,
                borderRadius: 8,
                background: payment === m ? COLORS.primaryLight : "#fff",
                color: payment === m ? COLORS.primaryDark : COLORS.muted,
                fontSize: 13,
                fontWeight: payment === m ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Cash tendered */}
      {payment === "Cash" && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500, display: "block", marginBottom: 6 }}>
            Tendered amount
          </label>
          <input
            type="number"
            value={tendered}
            onChange={(e) => setTendered(e.target.value)}
            placeholder="0.00"
            style={{
              width: "100%",
              padding: "10px 12px",
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              fontSize: 15,
              boxSizing: "border-box",
              fontWeight: 600,
            }}
          />
          {tendered && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: 13,
                color: change >= 0 ? COLORS.success : COLORS.danger,
                fontWeight: 600,
              }}
            >
              Change: {fmt(Math.max(0, change))}
              {change < 0 ? " (insufficient)" : ""}
            </p>
          )}
        </div>
      )}

      {/* Charge button */}
      <button
        onClick={onCheckout}
        disabled={!canCharge}
        style={{
          width: "100%",
          padding: "14px",
          background: canCharge ? COLORS.primary : COLORS.border,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 16,
          fontWeight: 700,
          cursor: canCharge ? "pointer" : "not-allowed",
        }}
      >
        Charge {cart.length > 0 ? fmt(subtotal) : ""}
      </button>
    </div>
  );
}
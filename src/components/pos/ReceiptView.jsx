import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

export default function ReceiptView({ receipt, onNewTransaction, onVoidSale }) {
  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <div
        style={{
          background: COLORS.card,
          borderRadius: 16,
          border: `1px solid ${COLORS.border}`,
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            background: "#e9f9f0",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem",
            color: COLORS.success,
            fontSize: 28,
          }}
        >
          ✓
        </div>
        <h2 style={{ margin: "0 0 4px", color: COLORS.text }}>Payment received</h2>
        <p style={{ color: COLORS.muted, margin: "0 0 1.5rem", fontSize: 14 }}>
          {receipt.id} · {receipt.date}
        </p>

        <div
          style={{
            background: COLORS.faint,
            borderRadius: 12,
            padding: "1rem",
            marginBottom: "1.5rem",
            textAlign: "left",
          }}
        >
          {receipt.cart.map((i) => (
            <div
              key={i.id}
              style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 14 }}
            >
              <span style={{ color: COLORS.text }}>
                {i.name} × {i.qty}
              </span>
              <span style={{ fontWeight: 500 }}>{fmt(i.price * i.qty)}</span>
            </div>
          ))}
          <div
            style={{
              borderTop: `1px solid ${COLORS.border}`,
              marginTop: 8,
              paddingTop: 8,
              display: "flex",
              justifyContent: "space-between",
              fontWeight: 700,
              fontSize: 15,
            }}
          >
            <span>Total</span>
            <span>{fmt(receipt.total)}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 13,
              marginTop: 4,
              color: COLORS.muted,
            }}
          >
            <span>Tendered</span>
            <span>{fmt(receipt.tendered)}</span>
          </div>
          {receipt.payment === "Cash" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                marginTop: 4,
                color: COLORS.primary,
                fontWeight: 600,
              }}
            >
              <span>Change</span>
              <span>{fmt(receipt.change)}</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={onVoidSale}
            style={{
              background: "#fff",
              color: COLORS.danger,
              border: `1px solid ${COLORS.danger}`,
              borderRadius: 10,
              padding: "12px 18px",
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Void sale
          </button>
          <button
            onClick={onNewTransaction}
            style={{
              background: COLORS.primary,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 24px",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            New transaction
          </button>
        </div>
      </div>
    </div>
  );
}

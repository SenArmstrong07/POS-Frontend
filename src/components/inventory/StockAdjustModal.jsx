import { useState } from "react";
import { COLORS } from "../../constants/colors";

export default function StockAdjustModal({ product, onClose, onConfirm }) {
  const [adjustType, setAdjustType] = useState("add");
  const [adjustQty, setAdjustQty] = useState("");

  if (!product) return null;

  const currentStock = product.stock || product.quantity_on_hand || 0;
  const qty = parseInt(adjustQty);
  const isValid = qty > 0 && (adjustType !== "remove" || qty <= currentStock);
  const overLimit = adjustType === "remove" && qty > currentStock;

  const handleConfirm = () => {
    if (!isValid) return;
    onConfirm(product, adjustType, qty);
    setAdjustQty("");
    setAdjustType("add");
  };

  const handleClose = () => {
    onClose();
    setAdjustQty("");
    setAdjustType("add");
  };

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
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.card,
          borderRadius: 16,
          border: "1px solid " + COLORS.border,
          padding: "1.5rem",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 600, color: COLORS.text }}>
          {adjustType === "add" ? "Add Stock" : "Remove Stock"}
        </h3>
        <p style={{ margin: "0 0 1.25rem", fontSize: 13, color: COLORS.muted }}>
          {product.name} · Current stock:{" "}
          <strong style={{ color: COLORS.text }}>{product.stock}</strong>
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["add", "remove"].map((t) => (
            <button
              key={t}
              onClick={() => setAdjustType(t)}
              style={{
                flex: 1,
                padding: "8px",
                border:
                  "1.5px solid " +
                  (adjustType === t ? (t === "add" ? COLORS.primary : COLORS.danger) : COLORS.border),
                borderRadius: 8,
                background: adjustType === t ? (t === "add" ? COLORS.primaryLight : "#fef2f2") : "#fff",
                color: adjustType === t ? (t === "add" ? COLORS.primaryDark : COLORS.danger) : COLORS.muted,
                fontSize: 13,
                fontWeight: adjustType === t ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {t === "add" ? "+ Add" : "− Remove"}
            </button>
          ))}
        </div>

        <label style={{ fontSize: 12, color: COLORS.muted, fontWeight: 500, display: "block", marginBottom: 6 }}>
          Quantity
        </label>
        <input
          type="number"
          value={adjustQty}
          onChange={(e) => setAdjustQty(e.target.value)}
          placeholder="0"
          min="1"
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid " + COLORS.border,
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            boxSizing: "border-box",
          }}
        />
        {overLimit && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: COLORS.danger, fontWeight: 500 }}>
            Cannot remove more than available stock ({product.stock})
          </p>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            style={{
              flex: 1,
              padding: "10px",
              background: !isValid ? COLORS.border : adjustType === "add" ? COLORS.primary : COLORS.danger,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: !isValid ? "not-allowed" : "pointer",
            }}
          >
            {adjustType === "add" ? "Add Stock" : "Remove Stock"}
          </button>
          <button
            onClick={handleClose}
            style={{
              padding: "10px 20px",
              background: COLORS.faint,
              color: COLORS.muted,
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
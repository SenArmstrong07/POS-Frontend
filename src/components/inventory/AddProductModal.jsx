import { COLORS } from "../../constants/colors";

const FIELDS = [
  ["Product name", "name", "text"],
  ["SKU", "sku", "text"],
  ["Category", "category", "text"],
  ["Price (₱)", "price", "number"],
  ["Cost (₱)", "cost", "number"],
  ["Stock qty", "stock", "number"],
  ["Reorder level", "reorder", "number"],
];

export default function AddProductModal({ show, onClose, form, setForm, onSubmit, loading = false }) {
  if (!show) return null;

  const handleCancel = () => {
    onClose();
    setForm({ name: "", sku: "", price: "", cost: "", stock: "", reorder: "", category: "" });
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
      onClick={() => !loading && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.card,
          borderRadius: 16,
          border: "1px solid " + COLORS.border,
          width: "100%",
          maxWidth: 520,
          maxHeight: "85vh",
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
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: COLORS.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.primary,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.text }}>New product</h3>
          </div>
          <button
          onClick={() => !loading && onClose()}
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

        {/* Body */}
        <form
          onSubmit={onSubmit}
          style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {FIELDS.map(([label, key, type], idx) => (
              <div key={key} style={{ gridColumn: idx < 1 ? "1 / -1" : "auto" }}>
                <label
                  style={{
                    fontSize: 12,
                    color: COLORS.muted,
                    fontWeight: 500,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  {label}
                </label>
                <input
                  required={["name", "sku", "price", "cost", "stock", "reorder"].includes(key)}
                  type={type}
                  disabled={loading}
                  value={form[key]}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Ensure numeric fields only accept positive numbers
                    if (["price", "cost", "stock", "reorder"].includes(key) && value && isNaN(parseFloat(value))) {
                      return;
                    }
                    setForm((f) => ({ ...f, [key]: value }));
                  }}
                  placeholder={key === "name" ? "e.g. Ezek the dog" : key === "sku" ? "e.g. WM-001" : ""}
                  min={["price", "cost", "stock", "reorder"].includes(key) ? "0" : undefined}
                  step={["price", "cost"].includes(key) ? "0.01" : "1"}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid " + COLORS.border,
                    borderRadius: 8,
                    fontSize: 14,
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid " + COLORS.faint,
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "11px 20px",
                background: loading ? COLORS.border : COLORS.primary,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving..." : "Save product"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: "11px 20px",
                background: COLORS.faint,
                color: COLORS.muted,
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

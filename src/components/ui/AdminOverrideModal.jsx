import { useEffect, useState } from "react";
import { COLORS } from "../../constants/colors";

export default function AdminOverrideModal({
  open,
  title,
  description,
  itemName,
  maxQuantity,
  defaultQuantity,
  requireQuantity = false,
  confirmLabel = "Approve",
  loading = false,
  error = "",
  success = "",
  onClose,
  onConfirm,
}) {
  const [form, setForm] = useState({
    reason: "",
    quantity: defaultQuantity || "",
    adminUsername: "",
    adminPassword: "",
  });

  useEffect(() => {
    if (open) {
      setForm({
        reason: "",
        quantity: defaultQuantity || "",
        adminUsername: "",
        adminPassword: "",
      });
    }
  }, [open, defaultQuantity]);

  if (!open) return null;

  const submit = (event) => {
    event.preventDefault();
    onConfirm({
      reason: form.reason.trim(),
      quantity: form.quantity,
      adminUsername: form.adminUsername.trim(),
      adminPassword: form.adminPassword,
    });
  };

  return (
    <div style={styles.overlay} role="dialog" aria-modal="true">
      <form onSubmit={submit} style={styles.modal}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>{title}</h3>
            {description && <p style={styles.description}>{description}</p>}
          </div>
          <button type="button" onClick={onClose} disabled={loading} style={styles.iconButton}>
            ×
          </button>
        </div>

        {itemName && <div style={styles.itemBox}>{itemName}</div>}

        {requireQuantity && (
          <label style={styles.field}>
            <span style={styles.label}>Quantity to void</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={maxQuantity}
              value={form.quantity}
              onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
              disabled={loading}
              style={styles.input}
              required
            />
          </label>
        )}

        <label style={styles.field}>
          <span style={styles.label}>Reason</span>
          <textarea
            value={form.reason}
            onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
            disabled={loading}
            rows={3}
            maxLength={255}
            style={{ ...styles.input, resize: "vertical" }}
            required
          />
        </label>

        <div style={styles.grid}>
          <label style={styles.field}>
            <span style={styles.label}>Admin username</span>
            <input
              value={form.adminUsername}
              onChange={(e) => setForm((prev) => ({ ...prev, adminUsername: e.target.value }))}
              disabled={loading}
              style={styles.input}
              required
            />
          </label>
          <label style={styles.field}>
            <span style={styles.label}>Admin password</span>
            <input
              type="password"
              value={form.adminPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, adminPassword: e.target.value }))}
              disabled={loading}
              style={styles.input}
              required
            />
          </label>
        </div>

        {error && <div style={{ ...styles.message, ...styles.error }}>{error}</div>}
        {success && <div style={{ ...styles.message, ...styles.success }}>{success}</div>}

        <div style={styles.actions}>
          <button type="button" onClick={onClose} disabled={loading} style={styles.secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={loading} style={styles.primaryButton}>
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.48)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    width: "100%",
    maxWidth: 520,
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 14,
    boxShadow: "0 24px 80px rgba(15,23,42,0.24)",
    padding: "1.25rem",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 14,
  },
  title: {
    margin: 0,
    color: COLORS.text,
    fontSize: 18,
  },
  description: {
    margin: "6px 0 0",
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 1.4,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.card,
    color: COLORS.muted,
    cursor: "pointer",
    fontSize: 22,
    lineHeight: 1,
  },
  itemBox: {
    background: COLORS.faint,
    borderRadius: 8,
    padding: "10px 12px",
    color: COLORS.text,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 12,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginBottom: 12,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: 600,
  },
  input: {
    width: "100%",
    border: `1px solid ${COLORS.border}`,
    borderRadius: 8,
    padding: "10px 12px",
    color: COLORS.text,
    fontSize: 14,
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
    gap: 10,
  },
  message: {
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    marginBottom: 12,
  },
  error: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: COLORS.danger,
  },
  success: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: COLORS.success,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },
  secondaryButton: {
    padding: "10px 14px",
    borderRadius: 8,
    border: `1px solid ${COLORS.border}`,
    background: COLORS.card,
    color: COLORS.muted,
    cursor: "pointer",
    fontWeight: 600,
  },
  primaryButton: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "none",
    background: COLORS.danger,
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
};

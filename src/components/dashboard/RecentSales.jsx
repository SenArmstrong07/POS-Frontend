import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

// Helper to parse sale amount from different field names
const getAmount = (sale) => {
  const amount = sale.total || sale.amount || sale.total_amount || sale.grand_total || '0';
  // Parse as float to handle string values from backend (e.g., "224.00")
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? 0 : parsed;
};

const formatLabel = (value) => {
  if (!value) return "Pending";
  return String(value)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getPaymentMethod = (sale) => {
  if (Array.isArray(sale.payments) && sale.payments.length > 0) {
    const methods = sale.payments
      .map((payment) => formatLabel(payment.method))
      .filter(Boolean);
    return methods.length > 1 ? methods.join(" + ") : methods[0] || "Pending";
  }

  return formatLabel(sale.payment || sale.payment_method);
};

const getSaleDate = (sale) => {
  const value = sale.completed_at || sale.date || sale.created_at || sale.created;
  if (!value) return "N/A";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString("en-PH");
};

const getSaleStatus = (sale) => formatLabel(sale.status || "PENDING");

const statusStyles = {
  Completed: { background: COLORS.primaryLight, color: COLORS.primaryDark },
  Void: { background: "#fef2f2", color: COLORS.danger },
  Draft: { background: "#faeeda", color: COLORS.warning },
  Pending: { background: COLORS.faint, color: COLORS.muted },
};

export default function RecentSales({ sales }) {
  return (
    <div style={{ background: COLORS.card, borderRadius: 14, border: `1px solid ${COLORS.border}`, padding: "1.25rem" }}>
      <h3 style={{ margin: "0 0 1rem", fontSize: 14, fontWeight: 600, color: COLORS.text }}>Recent transactions</h3>
      <div>
        {sales.length === 0 ? (
          <p style={{ color: COLORS.muted, fontSize: 14, textAlign: "center", padding: "2rem 0" }}>
            No transactions yet
          </p>
        ) : (
          sales.map((s) => {
            const status = getSaleStatus(s);
            const statusStyle = statusStyles[status] || statusStyles.Pending;
            return (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: `1px solid ${COLORS.faint}`,
                gap: 12,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                  {s.receipt_no || `Sale #${s.id}`}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: COLORS.muted }}>
                  {getSaleDate(s)} · {getPaymentMethod(s)}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", flexDirection: "column", gap: 5, flexShrink: 0 }}>
                <span style={{ fontWeight: 700, color: COLORS.primary, fontSize: 14 }}>{fmt(getAmount(s))}</span>
                <span
                  style={{
                    ...statusStyle,
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 999,
                  }}
                >
                  {status}
                </span>
              </div>
            </div>
            );
          })
        )}
      </div>
    </div>
  );
}

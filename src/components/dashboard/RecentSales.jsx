import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

// Helper to parse sale amount from different field names
const getAmount = (sale) => {
  const amount = sale.total || sale.amount || sale.total_amount || sale.grand_total || '0';
  // Parse as float to handle string values from backend (e.g., "224.00")
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? 0 : parsed;
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
          sales.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: `1px solid ${COLORS.faint}`,
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: COLORS.text }}>{s.id}</p>
                <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>
                  {(s.date || s.created_at || s.created || 'N/A')} · {(s.payment || s.payment_method || 'Pending')}
                </p>
              </div>
              <span style={{ fontWeight: 600, color: COLORS.primary, fontSize: 14 }}>{fmt(getAmount(s))}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
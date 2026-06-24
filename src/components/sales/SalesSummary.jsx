import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

// Helper to parse amount from different field names
const getAmount = (sale, field = 'total') => {
  let amount = 0;
  if (field === 'total') {
    amount = sale.total || sale.amount || sale.total_amount || sale.grand_total || '0';
  } else if (field === 'subtotal') {
    amount = sale.subtotal || sale.sub_total || sale.total || '0';
  }
  // Parse as float to handle string values from backend (e.g., "224.00")
  const parsed = parseFloat(amount);
  return isNaN(parsed) ? 0 : parsed;
};

export default function SalesSummary({ sales }) {
  const totalRevenue = (sales || []).reduce(
    (total, sale) => total + getAmount(sale, 'total'),
    0
  );

  const avgTransaction =
    sales.length > 0
      ? totalRevenue / sales.length
      : 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(180px,1fr))",
        gap: 12,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          background: COLORS.card,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          padding: "1rem",
        }}
      >
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 12,
            color: COLORS.muted,
          }}
        >
          Transactions
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          {sales.length}
        </p>
      </div>

      <div
        style={{
          background: COLORS.card,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          padding: "1rem",
        }}
      >
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 12,
            color: COLORS.muted,
          }}
        >
          Total Revenue
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.primary,
          }}
        >
          {fmt(totalRevenue)}
        </p>
      </div>

      <div
        style={{
          background: COLORS.card,
          borderRadius: 12,
          border: `1px solid ${COLORS.border}`,
          padding: "1rem",
        }}
      >
        <p
          style={{
            margin: "0 0 4px",
            fontSize: 12,
            color: COLORS.muted,
          }}
        >
          Avg. Transaction
        </p>

        <p
          style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: COLORS.text,
          }}
        >
          {fmt(avgTransaction)}
        </p>
      </div>
    </div>
  );
}
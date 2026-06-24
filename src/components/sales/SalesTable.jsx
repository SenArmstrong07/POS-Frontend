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

const getPaymentMethod = (sale) => {
  // Payment method is stored in payments array (payments[0].method)
  if (sale.payments && sale.payments.length > 0) {
    const method = sale.payments[0].method;
    // Convert uppercase (CASH, CARD, etc.) to title case for display
    return method ? method.charAt(0).toUpperCase() + method.slice(1).toLowerCase() : 'Pending';
  }
  // Fallback to direct fields
  return sale.payment || sale.payment_method || 'Pending';
};

const getSaleDate = (sale) => {
  return sale.date || sale.created_at || sale.created || 'N/A';
};

export default function SalesTable({ sales }) {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 14,
        border: `1px solid ${COLORS.border}`,
        overflow: "hidden",
      }}
    >
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: 540,
          }}
        >
          <thead>
            <tr style={{ background: COLORS.faint }}>
              {[
                "Sale ID",
                "Date",
                "Payment",
                "Subtotal",
                "Total",
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    fontSize: 12,
                    fontWeight: 600,
                    color: COLORS.muted,
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {(sales || []).map((sale, index) => (
              <tr
                key={sale.id}
                style={{
                  borderTop: `1px solid ${COLORS.faint}`,
                  background:
                    index % 2 === 0
                      ? "#fff"
                      : COLORS.faint,
                }}
              >
                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    fontFamily: "monospace",
                    color: COLORS.info,
                    fontWeight: 600,
                  }}
                >
                  {sale.id}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 13,
                    color: COLORS.muted,
                  }}
                >
                  {getSaleDate(sale)}
                </td>

                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 6,
                      background:
                        getPaymentMethod(sale) === "Cash"
                          ? "#f0f9ff"
                          : getPaymentMethod(sale) === "Card"
                          ? "#f0fdf4"
                          : "#fdf4ff",
                      color:
                        getPaymentMethod(sale) === "Cash"
                          ? COLORS.info
                          : getPaymentMethod(sale) === "Card"
                          ? COLORS.success
                          : "#7c3aed",
                    }}
                  >
                    {getPaymentMethod(sale)}
                  </span>
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                >
                  {fmt(getAmount(sale, 'subtotal'))}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {fmt(getAmount(sale, 'total'))}
                </td>
              </tr>
            ))}

            {sales.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: COLORS.muted,
                  }}
                >
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
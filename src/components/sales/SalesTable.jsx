import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

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
            {sales.map((sale, index) => (
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
                  {sale.date}
                </td>

                <td style={{ padding: "12px 16px" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 10px",
                      borderRadius: 6,
                      background:
                        sale.payment === "Cash"
                          ? "#f0f9ff"
                          : sale.payment === "Card"
                          ? "#f0fdf4"
                          : "#fdf4ff",
                      color:
                        sale.payment === "Cash"
                          ? COLORS.info
                          : sale.payment === "Card"
                          ? COLORS.success
                          : "#7c3aed",
                    }}
                  >
                    {sale.payment}
                  </span>
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    color: COLORS.text,
                  }}
                >
                  {fmt(sale.subtotal)}
                </td>

                <td
                  style={{
                    padding: "12px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: COLORS.primary,
                  }}
                >
                  {fmt(sale.total)}
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
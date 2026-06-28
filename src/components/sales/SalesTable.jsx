import { Fragment, useState } from "react";
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

export default function SalesTable({ sales, onVoidSale }) {
  const [expandedSaleId, setExpandedSaleId] = useState(null);
  const [selectedBySale, setSelectedBySale] = useState({});

  const getSaleItems = (sale) => sale.items || sale.cart || [];

  const itemKey = (item, index) => String(item.id || item.saleItemId || item.product || index);

  const selectedKeys = (sale) => selectedBySale[sale.id] || [];

  const setSelectedKeys = (sale, keys) => {
    setSelectedBySale((prev) => ({ ...prev, [sale.id]: keys }));
  };

  const toggleSale = (sale) => {
    setExpandedSaleId((current) => (current === sale.id ? null : sale.id));
  };

  const toggleItem = (sale, item, index) => {
    const key = itemKey(item, index);
    const current = selectedKeys(sale);
    const next = current.includes(key)
      ? current.filter((selected) => selected !== key)
      : [...current, key];
    setSelectedKeys(sale, next);
  };

  const toggleAll = (sale) => {
    const items = getSaleItems(sale);
    const allKeys = items.map(itemKey);
    const current = selectedKeys(sale);
    setSelectedKeys(sale, current.length === allKeys.length ? [] : allKeys);
  };

  const getSelectedItems = (sale) => {
    const selected = selectedKeys(sale);
    return getSaleItems(sale).filter((item, index) => selected.includes(itemKey(item, index)));
  };

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
            minWidth: 640,
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
                "Actions",
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
            {(sales || []).map((sale, index) => {
              const items = getSaleItems(sale);
              const selected = selectedKeys(sale);
              const allSelected = items.length > 0 && selected.length === items.length;
              const expanded = expandedSaleId === sale.id;

              return (
                <Fragment key={sale.id}>
                  <tr
                    onClick={() => toggleSale(sale)}
                    style={{
                      borderTop: `1px solid ${COLORS.faint}`,
                      background:
                        index % 2 === 0
                          ? "#fff"
                          : COLORS.faint,
                      cursor: "pointer",
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
                      <span style={{ color: COLORS.muted, marginRight: 8 }}>{expanded ? "▾" : "▸"}</span>
                      {sale.receipt_no || sale.id}
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

                    <td style={{ padding: "12px 16px" }}>
                      {sale.status === "COMPLETED" && (
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            onVoidSale?.(sale, getSelectedItems(sale));
                          }}
                          disabled={selected.length === 0}
                          style={{
                            padding: "7px 10px",
                            border: `1px solid ${selected.length === 0 ? COLORS.border : COLORS.danger}`,
                            borderRadius: 8,
                            background: "#fff",
                            color: selected.length === 0 ? COLORS.muted : COLORS.danger,
                            cursor: selected.length === 0 ? "not-allowed" : "pointer",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          Void
                        </button>
                      )}
                    </td>
                  </tr>

                  {expanded && (
                    <tr>
                      <td colSpan={6} style={{ padding: 0, background: "#fff" }}>
                        <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${COLORS.faint}` }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: 12,
                              marginBottom: 10,
                              flexWrap: "wrap",
                            }}
                          >
                            <label style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.text, fontSize: 13, fontWeight: 700 }}>
                              <input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() => toggleAll(sale)}
                                onClick={(event) => event.stopPropagation()}
                              />
                              Select All
                            </label>
                            <span style={{ color: COLORS.muted, fontSize: 12 }}>
                              {selected.length} of {items.length} selected
                            </span>
                          </div>

                          {items.length === 0 ? (
                            <div style={{ color: COLORS.muted, fontSize: 13, padding: "10px 0" }}>
                              No sale items found for this transaction.
                            </div>
                          ) : (
                            <div style={{ border: `1px solid ${COLORS.border}`, borderRadius: 10, overflow: "hidden" }}>
                              {items.map((item, itemIndex) => {
                                const key = itemKey(item, itemIndex);
                                const quantity = parseFloat(item.quantity || item.qty || 0);
                                const unitPrice = parseFloat(item.unit_price || item.price || 0);
                                const lineTotal = parseFloat(item.line_total || quantity * unitPrice || 0);

                                return (
                                  <label
                                    key={key}
                                    style={{
                                      display: "grid",
                                      gridTemplateColumns: "28px 1fr 80px 100px",
                                      gap: 10,
                                      alignItems: "center",
                                      padding: "10px 12px",
                                      borderTop: itemIndex === 0 ? "none" : `1px solid ${COLORS.faint}`,
                                      fontSize: 13,
                                      color: COLORS.text,
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={selected.includes(key)}
                                      onChange={() => toggleItem(sale, item, itemIndex)}
                                    />
                                    <span style={{ minWidth: 0 }}>
                                      <span style={{ display: "block", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {item.product_name || item.name || "Unnamed item"}
                                      </span>
                                      <span style={{ color: COLORS.muted, fontSize: 12 }}>
                                        {item.product_sku || item.sku || "No SKU"} · {fmt(unitPrice)} each
                                      </span>
                                    </span>
                                    <span style={{ color: COLORS.muted }}>× {quantity}</span>
                                    <span style={{ textAlign: "right", fontWeight: 700 }}>{fmt(lineTotal)}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          <p style={{ color: COLORS.warning, fontSize: 12, margin: "10px 0 0" }}>
                            Backend support for completed sales is whole-transaction void only. Select all items to void this sale.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}

            {sales.length === 0 && (
              <tr>
                <td
                  colSpan={6}
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

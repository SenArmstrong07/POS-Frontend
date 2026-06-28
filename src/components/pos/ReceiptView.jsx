import { COLORS } from "../../constants/colors";
import { fmt } from "../../utils/format";

const STORE_NAME = "LiteSpeedHost POS";

const num = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-PH");
};

const formatMethod = (value) => {
  if (!value) return "N/A";
  return String(value)
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getItems = (receipt) => {
  const source = receipt?.items?.length ? receipt.items : receipt?.cart || [];
  return source.map((item, index) => {
    const quantity = num(item.quantity ?? item.qty, 0);
    const unitPrice = num(item.unit_price ?? item.price, 0);
    const lineTotal = num(item.line_total, quantity * unitPrice);
    return {
      id: item.id || item.product || index,
      sku: item.product_sku || item.sku,
      name: item.product_name || item.name || "Unnamed item",
      quantity,
      unitPrice,
      lineTotal,
    };
  });
};

const getPayments = (receipt) => {
  if (Array.isArray(receipt?.payments) && receipt.payments.length > 0) {
    return receipt.payments;
  }

  return [{
    method: receipt?.payment || "N/A",
    amount: receipt?.total,
    tendered: receipt?.tendered,
    reference: receipt?.payment_reference,
  }];
};

function Row({ label, value, strong = false }) {
  return (
    <div className="receipt-row" style={{ fontWeight: strong ? 800 : 500 }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="receipt-divider" />;
}

export default function ReceiptView({ receipt, onNewTransaction, onVoidSale }) {
  const items = getItems(receipt);
  const payments = getPayments(receipt);
  const receiptNumber = receipt?.receipt_no || receipt?.id || "N/A";
  const subtotal = num(receipt?.subtotal, items.reduce((sum, item) => sum + item.lineTotal, 0));
  const discount = num(receipt?.discount_total, 0);
  const tax = num(receipt?.tax_amount, 0);
  const netOfTax = num(receipt?.net_of_tax, subtotal - tax);
  const total = num(receipt?.total, subtotal - discount);
  const tenderedAmount = num(
    receipt?.tendered ?? payments[0]?.tendered ?? receipt?.amount_paid,
    total
  );
  const change = num(receipt?.change ?? receipt?.change_due, Math.max(0, tenderedAmount - total));
  const isVoided = receipt?.status === "VOID" || Boolean(receipt?.voided_at || receipt?.void_reason);

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <style>{`
        .receipt-shell { background: ${COLORS.card}; border: 1px solid ${COLORS.border}; border-radius: 16px; padding: 1.25rem; box-shadow: 0 10px 28px rgba(15,23,42,.08); }
        .receipt-paper { width: min(100%, 360px); margin: 0 auto; background: #fff; color: #111827; border: 1px solid #d1d5db; padding: 20px 18px; font-family: "Courier New", ui-monospace, monospace; font-size: 12px; line-height: 1.36; box-shadow: 0 8px 22px rgba(15,23,42,.10); }
        .receipt-center { text-align: center; }
        .receipt-muted { color: #4b5563; }
        .receipt-divider { border-top: 1px dashed #111827; margin: 10px 0; }
        .receipt-row { display: flex; justify-content: space-between; gap: 14px; padding: 2px 0; }
        .receipt-row span:last-child { text-align: right; }
        .receipt-item { padding: 5px 0; }
        .receipt-item-name { font-weight: 700; overflow-wrap: anywhere; }
        .receipt-item-meta { display: grid; grid-template-columns: 1fr auto; gap: 10px; color: #374151; }
        .receipt-total { font-size: 15px; font-weight: 900; }
        .receipt-void { border: 1px dashed ${COLORS.danger}; color: ${COLORS.danger}; padding: 8px; margin-top: 10px; text-align: center; font-weight: 800; }
        .receipt-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 18px; }
        @media print {
          body { background: #fff !important; }
          body * { visibility: hidden; }
          .receipt-paper, .receipt-paper * { visibility: visible; }
          .receipt-paper { position: absolute; left: 0; top: 0; width: 80mm; border: none; box-shadow: none; padding: 0; color: #000; }
          .receipt-shell { border: none; box-shadow: none; padding: 0; }
          .receipt-actions { display: none !important; }
        }
      `}</style>

      <div className="receipt-shell">
        <div className="receipt-paper">
          <div className="receipt-center">
            <div style={{ fontSize: 17, fontWeight: 900, letterSpacing: ".04em" }}>{STORE_NAME}</div>
            <div className="receipt-muted">Official Sales Receipt</div>
            <div className="receipt-muted">Thank you for shopping with us</div>
          </div>

          <Divider />

          <Row label="Receipt No." value={receiptNumber} />
          <Row label="Date/Time" value={formatDateTime(receipt?.completed_at || receipt?.date)} />
          <Row label="Cashier" value={receipt?.cashier || "N/A"} />
          <Row label="Status" value={formatMethod(receipt?.status || "COMPLETED")} />

          <Divider />

          <div style={{ fontWeight: 900, marginBottom: 4 }}>ITEMS</div>
          {items.map((item) => (
            <div key={item.id} className="receipt-item">
              <div className="receipt-item-name">{item.name}</div>
              {item.sku && <div className="receipt-muted">SKU: {item.sku}</div>}
              <div className="receipt-item-meta">
                <span>{item.quantity} x {fmt(item.unitPrice)}</span>
                <span>{fmt(item.lineTotal)}</span>
              </div>
            </div>
          ))}

          <Divider />

          <Row label="Subtotal" value={fmt(subtotal)} />
          {discount > 0 && <Row label="Discount" value={`-${fmt(discount)}`} />}
          {tax > 0 && <Row label="Tax" value={fmt(tax)} />}
          {netOfTax > 0 && tax > 0 && <Row label="Net of Tax" value={fmt(netOfTax)} />}
          <div className="receipt-row receipt-total">
            <span>TOTAL</span>
            <span>{fmt(total)}</span>
          </div>

          <Divider />

          <div style={{ fontWeight: 900, marginBottom: 4 }}>PAYMENT</div>
          {payments.map((payment, index) => (
            <div key={payment.id || index}>
              <Row label="Method" value={formatMethod(payment.method)} />
              <Row label="Amount" value={fmt(num(payment.amount, total))} />
              {payment.reference && <Row label="Reference" value={payment.reference} />}
            </div>
          ))}
          <Row label="Tendered" value={fmt(tenderedAmount)} />
          <Row label="Change" value={fmt(Math.max(0, change))} strong />

          {isVoided && (
            <>
              <Divider />
              <div className="receipt-void">
                VOID / REFUND
                {receipt?.voided_at && <div style={{ marginTop: 4 }}>{formatDateTime(receipt.voided_at)}</div>}
                {receipt?.void_reason && <div style={{ marginTop: 4 }}>Reason: {receipt.void_reason}</div>}
              </div>
            </>
          )}

          <Divider />

          <div className="receipt-center receipt-muted">
            Items sold: {items.length}
            <br />
            Please keep this receipt for your records.
          </div>
        </div>

        <div className="receipt-actions">
          {!isVoided && (
            <button
              onClick={onVoidSale}
              style={{
                background: "#fff",
                color: COLORS.danger,
                border: `1px solid ${COLORS.danger}`,
                borderRadius: 10,
                padding: "12px 18px",
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Void sale
            </button>
          )}
          <button
            onClick={() => window.print()}
            style={{
              background: COLORS.text,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 18px",
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Print
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
              fontWeight: 800,
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

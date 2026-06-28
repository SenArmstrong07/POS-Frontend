import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ReceiptView from "./ReceiptView";

const baseReceipt = {
  id: "R-100",
  receipt_no: "POS20260629-000001",
  completed_at: "2026-06-29T10:30:00+08:00",
  cashier: "cashier",
  status: "COMPLETED",
  items: [
    {
      id: 1,
      product_name: "Coffee",
      product_sku: "COF-1",
      quantity: "2.00",
      unit_price: "100.00",
      line_total: "200.00",
    },
  ],
  payments: [{ method: "CASH", amount: "200.00", tendered: "250.00" }],
  subtotal: "200.00",
  discount_total: "0.00",
  total: "200.00",
  change_due: "50.00",
};

describe("ReceiptView", () => {
  it("shows a Tendered row for cashless receipts even when tendered is missing", () => {
    render(
      <ReceiptView
        receipt={{
          id: "R-100",
          date: "2026-06-28",
          cart: [{ id: 1, name: "Coffee", qty: 1, price: 100 }],
          total: 100,
          payment: "Card",
        }}
        onNewTransaction={() => {}}
        onVoidSale={() => {}}
      />
    );

    const tenderedLabel = screen.getByText("Tendered");
    expect(tenderedLabel).toBeInTheDocument();
    expect(tenderedLabel.parentElement).toHaveTextContent("₱100.00");
  });

  it("renders complete supermarket receipt transaction details", () => {
    render(<ReceiptView receipt={baseReceipt} onNewTransaction={() => {}} onVoidSale={() => {}} />);

    expect(screen.getByText("LiteSpeedHost POS")).toBeInTheDocument();
    expect(screen.getByText("POS20260629-000001")).toBeInTheDocument();
    expect(screen.getByText("cashier")).toBeInTheDocument();
    expect(screen.getByText("Cash")).toBeInTheDocument();
    expect(screen.getByText("Coffee")).toBeInTheDocument();
    expect(screen.getByText("2 x ₱100.00")).toBeInTheDocument();
    expect(screen.getAllByText("₱200.00").length).toBeGreaterThan(0);
    expect(screen.getByText("₱250.00")).toBeInTheDocument();
    expect(screen.getByText("₱50.00")).toBeInTheDocument();
  });

  it("shows void and refund information when void fields are present", () => {
    render(
      <ReceiptView
        receipt={{
          ...baseReceipt,
          status: "VOID",
          voided_at: "2026-06-29T11:00:00+08:00",
          void_reason: "Customer refund",
        }}
        onNewTransaction={() => {}}
        onVoidSale={() => {}}
      />
    );

    expect(screen.getByText("VOID / REFUND")).toBeInTheDocument();
    expect(screen.getByText("Reason: Customer refund")).toBeInTheDocument();
    expect(screen.queryByText("Void sale")).not.toBeInTheDocument();
  });
});

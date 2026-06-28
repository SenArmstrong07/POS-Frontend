import { render, screen } from "@testing-library/react";
import ReceiptView from "./ReceiptView";

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
});

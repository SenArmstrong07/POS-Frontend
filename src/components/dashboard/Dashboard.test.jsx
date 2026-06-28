import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "./Dashboard";
import { apiCalls } from "../../services/api";

jest.mock("../../services/api", () => ({
  apiCalls: {
    getDailySummary: jest.fn(),
    getLowStockProducts: jest.fn(),
  },
}));

describe("Dashboard", () => {
  beforeEach(() => {
    apiCalls.getDailySummary.mockResolvedValue({
      data: {
        gross_sales: 100,
        transactions: 12,
        sales_count: 7,
      },
    });
    apiCalls.getLowStockProducts.mockResolvedValue({ data: [] });
  });

  it("prefers the transaction count over sales_count for today's sales metric", async () => {
    render(<Dashboard products={[]} sales={[]} />);

    await waitFor(() => expect(apiCalls.getDailySummary).toHaveBeenCalled());
    expect(await screen.findByText("12")).toBeInTheDocument();
  });
});

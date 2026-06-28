import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dashboard from "./Dashboard";
import { apiCalls } from "../../services/api";

jest.mock("../../services/api", () => ({
  apiCalls: {
    getDashboard: jest.fn(),
    getSales: jest.fn(),
    getDailySummary: jest.fn(),
    getLowStockProducts: jest.fn(),
    getTopProducts: jest.fn(),
  },
}));

describe("Dashboard", () => {
  beforeEach(() => {
    apiCalls.getDashboard.mockResolvedValue({
      data: {
        today: {
          gross_sales: 100,
          transactions: 12,
          total_tax: 0,
        },
        low_stock_count: 0,
        top_item: null,
      },
    });
    apiCalls.getSales.mockResolvedValue({
      data: {
        count: 12,
        results: [],
      },
    });
    apiCalls.getDailySummary.mockResolvedValue({
      data: {
        gross_sales: 100,
        transactions: 12,
        sales_count: 7,
      },
    });
    apiCalls.getLowStockProducts.mockResolvedValue({ data: [] });
    apiCalls.getTopProducts.mockResolvedValue({ data: { results: [] } });
  });

  it("uses the backend dashboard transaction count for today's sales metric", async () => {
    render(<Dashboard products={[]} sales={[]} />);

    await waitFor(() => expect(apiCalls.getDashboard).toHaveBeenCalled());
    expect((await screen.findAllByText("12")).length).toBeGreaterThan(0);
  });
});

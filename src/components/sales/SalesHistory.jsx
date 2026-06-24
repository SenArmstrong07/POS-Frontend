import { useState } from "react";
import SalesFilters from "./SalesFilters";
import SalesSummary from "./SalesSummary";
import SalesTable from "./SalesTable";

export default function SalesHistory({ sales }) {
  const [payFilter, setPayFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // Helper to get payment method from payments array or fallback fields
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

  // Helper to get date from different field names
  const getSaleDate = (sale) => {
    return sale.date || sale.created_at || sale.created || 'N/A';
  };

  const filtered = (sales || []).filter(
    (s) => {
      // For payment filtering, normalize both filter and sale method to title case
      if (payFilter !== "All") {
        const saleMethod = getPaymentMethod(s);
        if (saleMethod !== payFilter) return false;
      }
      // For date filtering
      if (dateFilter && !String(getSaleDate(s)).startsWith(dateFilter)) return false;
      return true;
    }
  );

  return (
    <div>
      <SalesFilters
        payFilter={payFilter}
        setPayFilter={setPayFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      <SalesSummary sales={filtered} />

      <SalesTable sales={filtered} />
    </div>
  );
}
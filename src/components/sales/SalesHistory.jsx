import { useState } from "react";
import SalesFilters from "./SalesFilters";
import SalesSummary from "./SalesSummary";
import SalesTable from "./SalesTable";

export default function SalesHistory({ sales }) {
  const [payFilter, setPayFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const filtered = sales.filter(
    (s) =>
      (payFilter === "All" || s.payment === payFilter) &&
      (!dateFilter || s.date.startsWith(dateFilter))
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
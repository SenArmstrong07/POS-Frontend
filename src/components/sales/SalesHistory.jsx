import { useState } from "react";
import { apiCalls, getAuthToken, setAuthToken } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiErrors";
import AdminOverrideModal from "../ui/AdminOverrideModal";
import SalesFilters from "./SalesFilters";
import SalesSummary from "./SalesSummary";
import SalesTable from "./SalesTable";

export default function SalesHistory({ sales, onRefreshData }) {
  const [payFilter, setPayFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidLoading, setVoidLoading] = useState(false);
  const [voidError, setVoidError] = useState("");
  const [toast, setToast] = useState(null);

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
      {toast && (
        <div
          style={{
            marginBottom: 12,
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 13,
            color: toast.type === "error" ? "#991b1b" : "#166534",
            background: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
            border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          }}
        >
          {toast.message}
        </div>
      )}

      <SalesFilters
        payFilter={payFilter}
        setPayFilter={setPayFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
      />

      <SalesSummary sales={filtered} />

      <SalesTable
        sales={filtered}
        onVoidSale={(sale, selectedItems) => {
          setVoidTarget({ sale, selectedItems });
          setVoidError("");
          setToast(null);
        }}
      />

      <AdminOverrideModal
        open={Boolean(voidTarget)}
        title="Void selected sale items"
        description="Admin authorization is required. The current backend can reverse completed sales only by voiding the whole transaction."
        itemName={voidTarget ? `${voidTarget.sale.receipt_no || voidTarget.sale.id} · ${voidTarget.selectedItems.length} selected` : ""}
        confirmLabel="Void sale"
        loading={voidLoading}
        error={voidError}
        onClose={() => !voidLoading && setVoidTarget(null)}
        onConfirm={async ({ reason, adminUsername, adminPassword }) => {
          if (!reason || !adminUsername || !adminPassword) {
            setVoidError("Reason and admin credentials are required.");
            return;
          }

          const saleItems = voidTarget?.sale?.items || [];
          const selectedItems = voidTarget?.selectedItems || [];
          if (selectedItems.length === 0) {
            setVoidError("Select at least one sale item to void.");
            return;
          }
          if (selectedItems.length !== saleItems.length) {
            setVoidError("The backend only supports whole-transaction voids for completed sales. Use Select All to void this sale.");
            return;
          }

          const cashierToken = getAuthToken();
          setVoidLoading(true);
          setVoidError("");
          try {
            const loginRes = await apiCalls.login(adminUsername, adminPassword);
            const adminToken = loginRes.data.access || loginRes.data.token || loginRes.data.access_token;
            const adminRole = loginRes.data.user?.role;
            if (!adminToken) throw new Error("Admin login did not return a token.");
            if (adminRole && adminRole !== "ADMIN") throw new Error("The approving account must be an admin.");

            setAuthToken(adminToken);
            await apiCalls.voidSale(voidTarget.sale.id, { reason });
            setAuthToken(cashierToken);
            await onRefreshData?.();
            setVoidTarget(null);
            setToast({ type: "success", message: "Sale voided successfully." });
          } catch (err) {
            setAuthToken(cashierToken);
            setVoidError(getApiErrorMessage(err, "Unable to void sale."));
          } finally {
            setVoidLoading(false);
          }
        }}
      />
    </div>
  );
}

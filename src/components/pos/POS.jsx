import { useState } from "react";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { getProductId, getProductPrice } from "../../utils/productFields";
import { apiCalls, getAuthToken, setAuthToken } from "../../services/api";
import AdminOverrideModal from "../ui/AdminOverrideModal";
import ProductGrid from "./ProductGrid";
import CartPanel from "./CartPanel";
import CheckoutPanel from "./CheckoutPanel";
import ReceiptView from "./ReceiptView";

export default function POS({ products, onSale, onRefreshData }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [activeSale, setActiveSale] = useState(null);
  const [tendered, setTendered] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [receipt, setReceipt] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [voidTarget, setVoidTarget] = useState(null);
  const [voidLoading, setVoidLoading] = useState(false);
  const [voidError, setVoidError] = useState("");
  const [receiptVoidOpen, setReceiptVoidOpen] = useState(false);
  const [receiptVoidLoading, setReceiptVoidLoading] = useState(false);
  const [receiptVoidError, setReceiptVoidError] = useState("");

  const filtered = (products || []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = activeSale ? parseFloat(activeSale.total || activeSale.subtotal || 0) : cart.reduce((a, i) => a + (i.price || 0) * (i.qty || 0), 0);
  const change = parseFloat(tendered || 0) - subtotal;

  const saleToCart = (sale) =>
    (sale?.items || []).map((item) => ({
      id: item.product,
      saleItemId: item.id,
      sku: item.product_sku,
      name: item.product_name,
      price: parseFloat(item.unit_price || 0),
      qty: parseFloat(item.quantity || 0),
      lineTotal: parseFloat(item.line_total || 0),
    }));

  const cartPayload = (items) =>
    items.map((item) => ({
      product: item.id,
      quantity: String(item.qty || 0),
    }));

  const syncDraftCart = async (nextCart) => {
    setSyncing(true);
    setToast(null);
    try {
      const response = activeSale
        ? await apiCalls.setSaleItems(activeSale.id, cartPayload(nextCart))
        : await apiCalls.createSale({ cart: cartPayload(nextCart) });
      setActiveSale(response.data);
      setCart(saleToCart(response.data));
      await onRefreshData?.();
      return response.data;
    } catch (err) {
      const message = getApiErrorMessage(err, "Unable to update the current sale.");
      setToast({ type: "error", message });
      throw err;
    } finally {
      setSyncing(false);
    }
  };

  const addToCart = async (p) => {
    if (syncing || checkoutLoading) return;
    const productId = getProductId(p);
    const price = getProductPrice(p);
    if (!productId) {
      setToast({ type: "error", message: "This product is missing a backend id and cannot be sold." });
      return;
    }
    if (price <= 0) {
      setToast({ type: "error", message: "This product has no sellable price." });
      return;
    }

    const existing = cart.find((i) => i.id === productId);
    const nextCart = existing
      ? cart.map((i) => (i.id === productId ? { ...i, qty: i.qty + 1 } : i))
      : [...cart, { ...p, id: productId, price, qty: 1 }];
    try {
      await syncDraftCart(nextCart);
    } catch {
      // Error state is already shown by syncDraftCart.
    }
  };

  const updateQty = async (id, delta) => {
    if (syncing || checkoutLoading) return;
    const item = cart.find((i) => i.id === id);
    if (!item) return;

    if (delta < 0) {
      setVoidTarget({ item, defaultQuantity: 1 });
      setVoidError("");
      return;
    }

    const nextCart = cart.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i));
    try {
      await syncDraftCart(nextCart);
    } catch {
      // Error state is already shown by syncDraftCart.
    }
  };

  const openFullItemVoid = (item) => {
    setVoidTarget({ item, defaultQuantity: item.qty });
    setVoidError("");
  };

  const approveDraftItemVoid = async ({ reason, quantity, adminUsername, adminPassword }) => {
    if (!voidTarget?.item?.saleItemId) {
      setVoidError("This item is not synced with the backend yet.");
      return;
    }

    if (!reason || !adminUsername || !adminPassword) {
      setVoidError("Reason and admin credentials are required.");
      return;
    }

    const qty = parseFloat(quantity);
    if (!qty || qty <= 0 || qty > voidTarget.item.qty) {
      setVoidError(`Quantity must be between 0.01 and ${voidTarget.item.qty}.`);
      return;
    }

    const cashierToken = getAuthToken();
    setVoidLoading(true);
    setVoidError("");
    try {
      const requestRes = await apiCalls.createItemVoidRequest({
        sale_item: voidTarget.item.saleItemId,
        quantity: String(qty),
        reason,
      });

      const loginRes = await apiCalls.login(adminUsername, adminPassword);
      const adminToken = loginRes.data.access || loginRes.data.token || loginRes.data.access_token;
      const adminRole = loginRes.data.user?.role;
      if (!adminToken) throw new Error("Admin login did not return a token.");
      if (adminRole && adminRole !== "ADMIN") throw new Error("The approving account must be an admin.");

      setAuthToken(adminToken);
      await apiCalls.approveItemVoidRequest(requestRes.data.id, {
        password: adminPassword,
        review_note: reason,
      });

      setAuthToken(cashierToken);
      const refreshed = await apiCalls.getSaleDetail(activeSale.id);
      setActiveSale(refreshed.data);
      setCart(saleToCart(refreshed.data));
      setVoidTarget(null);
      setToast({ type: "success", message: "Item void approved." });
      await onRefreshData?.();
    } catch (err) {
      setAuthToken(cashierToken);
      setVoidError(getApiErrorMessage(err, "Unable to approve item void."));
    } finally {
      setVoidLoading(false);
    }
  };

  const checkout = async () => {
    if (cart.length === 0 || !activeSale || checkoutLoading) return;
    const paymentMethod = (payment || "Cash").toUpperCase();
    const payments = [{
      method: paymentMethod,
      amount: String(subtotal),
      tendered: String(payment === "Cash" ? parseFloat(tendered || 0) : subtotal),
    }];

    setCheckoutLoading(true);
    setToast(null);
    try {
      const completedSale = await onSale(activeSale.id, payments);
      setReceipt({
        ...completedSale,
        id: completedSale.receipt_no || completedSale.id,
        saleId: completedSale.id,
        date: completedSale.completed_at || new Date().toLocaleString("en-PH"),
        payment,
        total: parseFloat(completedSale.total || subtotal),
        tendered: parseFloat(tendered || subtotal),
        change: Math.max(0, change),
        cart,
      });
      setActiveSale(null);
      setCart([]);
      setTendered("");
    } catch (err) {
      setToast({ type: "error", message: getApiErrorMessage(err, "Unable to complete sale.") });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const approveReceiptVoid = async ({ reason, adminUsername, adminPassword }) => {
    if (!receipt?.saleId) {
      setReceiptVoidError("This receipt is missing the backend sale id.");
      return;
    }
    if (!reason || !adminUsername || !adminPassword) {
      setReceiptVoidError("Reason and admin credentials are required.");
      return;
    }

    const cashierToken = getAuthToken();
    setReceiptVoidLoading(true);
    setReceiptVoidError("");
    try {
      const loginRes = await apiCalls.login(adminUsername, adminPassword);
      const adminToken = loginRes.data.access || loginRes.data.token || loginRes.data.access_token;
      const adminRole = loginRes.data.user?.role;
      if (!adminToken) throw new Error("Admin login did not return a token.");
      if (adminRole && adminRole !== "ADMIN") throw new Error("The approving account must be an admin.");

      setAuthToken(adminToken);
      await apiCalls.voidSale(receipt.saleId, { reason });
      setAuthToken(cashierToken);
      await onRefreshData?.();
      setReceiptVoidOpen(false);
      setToast({ type: "success", message: "Sale voided successfully." });
      setReceipt(null);
    } catch (err) {
      setAuthToken(cashierToken);
      setReceiptVoidError(getApiErrorMessage(err, "Unable to void sale."));
    } finally {
      setReceiptVoidLoading(false);
    }
  };

  // Receipt screen
  if (receipt) {
    return (
      <>
        <ReceiptView
          receipt={receipt}
          onNewTransaction={() => setReceipt(null)}
          onVoidSale={() => {
            setReceiptVoidOpen(true);
            setReceiptVoidError("");
          }}
        />
        <AdminOverrideModal
          open={receiptVoidOpen}
          title="Void completed sale"
          description="The backend will void this whole transaction and return all sold quantities to stock."
          itemName={receipt ? `${receipt.id} · ${receipt.payment}` : ""}
          confirmLabel="Void sale"
          loading={receiptVoidLoading}
          error={receiptVoidError}
          onClose={() => !receiptVoidLoading && setReceiptVoidOpen(false)}
          onConfirm={approveReceiptVoid}
        />
      </>
    );
  }

  // Main POS screen
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16 }} className="pos-grid">
      <style>{`.pos-grid{grid-template-columns:1fr}@media(min-width:900px){.pos-grid{grid-template-columns:1fr 380px!important}}`}</style>

      <ProductGrid
        search={search}
        setSearch={setSearch}
        products={filtered}
        cart={cart}
        onAddToCart={addToCart}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        {toast && (
          <div
            style={{
              marginBottom: 10,
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
        <CartPanel
          cart={cart}
          subtotal={subtotal}
          onUpdateQty={updateQty}
          onRequestVoid={openFullItemVoid}
          disabled={syncing || checkoutLoading || voidLoading}
        />
        <CheckoutPanel
          cart={cart}
          subtotal={subtotal}
          payment={payment}
          setPayment={setPayment}
          tendered={tendered}
          setTendered={setTendered}
          change={change}
          onCheckout={checkout}
          loading={checkoutLoading}
        />
      </div>

      <AdminOverrideModal
        open={Boolean(voidTarget)}
        title="Void current sale item"
        description="This item will stay in the cart until the backend void request is approved by an admin."
        itemName={voidTarget?.item ? `${voidTarget.item.name} × ${voidTarget.item.qty}` : ""}
        maxQuantity={voidTarget?.item?.qty}
        defaultQuantity={voidTarget?.defaultQuantity}
        requireQuantity
        confirmLabel="Approve void"
        loading={voidLoading}
        error={voidError}
        onClose={() => !voidLoading && setVoidTarget(null)}
        onConfirm={approveDraftItemVoid}
      />
    </div>
  );
}

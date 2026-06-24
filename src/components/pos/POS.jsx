import { useState } from "react";
import { fmt } from "../../utils/format";
import ProductGrid from "./ProductGrid";
import CartPanel from "./CartPanel";
import CheckoutPanel from "./CheckoutPanel";
import ReceiptView from "./ReceiptView";

export default function POS({ products, onSale }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [tendered, setTendered] = useState("");
  const [payment, setPayment] = useState("Cash");
  const [receipt, setReceipt] = useState(null);

  // Helper to parse price from different field names
  const getPrice = (product) => {
    const price = product.price || product.unit_price || product.selling_price || product.price_per_unit || 0;
    return parseFloat(price) || 0;
  };

  const filtered = (products || []).filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(search.toLowerCase())
  );

  const subtotal = cart.reduce((a, i) => a + (i.price || 0) * (i.qty || 0), 0);
  const change = parseFloat(tendered || 0) - subtotal;

  const addToCart = (p) => {
    const price = getPrice(p);
    setCart((c) => {
      const ex = c.find((i) => i.id === p.id);
      if (ex) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...p, price, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((c) =>
      c
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const checkout = () => {
    if (cart.length === 0) return;
    const sale = {
      id: `TXN-${Date.now()}`,
      date: new Date().toLocaleString("en-PH"),
      payment,
      subtotal,
      total: subtotal,
      items: cart.length,
    };
    onSale(sale, cart);
    setReceipt({ ...sale, cart, tendered: parseFloat(tendered), change: Math.max(0, change) });
    setCart([]);
    setTendered("");
  };

  // Receipt screen
  if (receipt) {
    return <ReceiptView receipt={receipt} onNewTransaction={() => setReceipt(null)} />;
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
        <CartPanel cart={cart} subtotal={subtotal} onUpdateQty={updateQty} />
        <CheckoutPanel
          cart={cart}
          subtotal={subtotal}
          payment={payment}
          setPayment={setPayment}
          tendered={tendered}
          setTendered={setTendered}
          change={change}
          onCheckout={checkout}
        />
      </div>
    </div>
  );
}
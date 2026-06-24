import { useState } from "react";
import InventoryToolbar from "./InventoryToolbar";
import AddProductModal from "./AddProductModal";
import ActivityLogModal from "./ActivityLogModal";
import StockAdjustModal from "./StockAdjustModal";
import ProductTable from "./ProductTable";

export default function Inventory({ products, setProducts }) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", sku: "", price: "", cost: "", stock: "", reorder: "", category: "" });
  const [stockLogs, setStockLogs] = useState([]);
  const [showLog, setShowLog] = useState(false);
  const [adjustModal, setAdjustModal] = useState(null);

  const filtered = (products || []).filter(
    (p) => p && (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.sku || '').toLowerCase().includes(search.toLowerCase())
  );

  const addLog = (action, product, qty) => {
    const entry = {
      id: Date.now() + Math.random(),
      time: new Date().toLocaleString("en-PH"),
      action,
      productName: product.name,
      sku: product.sku,
      qty,
    };
    setStockLogs((prev) => [entry, ...prev]);
  };

  const addProduct = (e) => {
    e.preventDefault();
    const p = {
      id: Date.now(),
      name: form.name,
      sku: form.sku,
      price: parseFloat(form.price) || 0,
      cost: parseFloat(form.cost) || 0,
      stock: parseInt(form.stock) || 0,
      reorder: parseInt(form.reorder) || 5,
      category: form.category || "General",
    };
    setProducts((prev) => [...prev, p]);
    addLog("Added product", p, p.stock);
    setForm({ name: "", sku: "", price: "", cost: "", stock: "", reorder: "", category: "" });
    setShowAdd(false);
  };

  const handleCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const lines = ev.target.result.split("\n").filter(Boolean);
      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = lines
        .slice(1)
        .map((line) => {
          const vals = line.split(",");
          const obj = {};
          header.forEach((h, i) => (obj[h] = vals[i] ? vals[i].trim() : ""));
          return {
            id: Date.now() + Math.random(),
            name: obj.name || obj.product_name || "",
            sku: obj.sku || obj.code || "",
            price: parseFloat(obj.price || obj.unit_price || 0) || 0,
            cost: parseFloat(obj.cost || obj.cost_price || 0) || 0,
            stock: parseInt(obj.stock || obj.quantity_on_hand || 0) || 0,
            reorder: parseInt(obj.reorder || obj.reorder_level || 5) || 5,
            category: obj.category || obj.cat_id || "General",
          };
        })
        .filter((r) => r.name);
      rows.forEach((r) => addLog("Bulk import", r, r.stock));
      setProducts((prev) => [...prev, ...rows]);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const openAdjust = (product, type) => {
    setAdjustModal({ product, type });
  };

  const confirmAdjust = (product, type, qty) => {
    setProducts((prev) =>
      (prev || []).map((p) => {
        if (p.id !== product.id) return p;
        const currentStock = p.stock || p.quantity_on_hand || 0;
        const newStock = type === "add" ? currentStock + qty : Math.max(0, currentStock - qty);
        return { ...p, stock: newStock, quantity_on_hand: newStock };
      })
    );
    addLog(type === "add" ? "Stock added" : "Stock removed", product, qty);
    setAdjustModal(null);
  };

  return (
    <div>
      <InventoryToolbar
        search={search}
        setSearch={setSearch}
        onAddClick={() => setShowAdd(true)}
        onLogClick={() => setShowLog(true)}
        onCSVImport={handleCSV}
        logCount={stockLogs.length}
      />

      <AddProductModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        form={form}
        setForm={setForm}
        onSubmit={addProduct}
      />

      <ActivityLogModal
        show={showLog}
        onClose={() => setShowLog(false)}
        logs={stockLogs}
        onClearLogs={() => setStockLogs([])}
      />

      <StockAdjustModal
        product={adjustModal?.product ?? null}
        onClose={() => setAdjustModal(null)}
        onConfirm={confirmAdjust}
      />

      <ProductTable products={filtered} onAdjust={openAdjust} />
    </div>
  );
}
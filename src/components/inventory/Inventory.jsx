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

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase())
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
      price: parseFloat(form.price),
      cost: parseFloat(form.cost),
      stock: parseInt(form.stock),
      reorder: parseInt(form.reorder),
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
            name: obj.name,
            sku: obj.sku,
            price: parseFloat(obj.price) || 0,
            cost: parseFloat(obj.cost) || 0,
            stock: parseInt(obj.stock) || 0,
            reorder: parseInt(obj.reorder) || 5,
            category: obj.category || "General",
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
      prev.map((p) => {
        if (p.id !== product.id) return p;
        const newStock = type === "add" ? p.stock + qty : Math.max(0, p.stock - qty);
        return { ...p, stock: newStock };
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
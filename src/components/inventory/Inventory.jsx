import { useCallback, useEffect, useRef, useState } from "react";
import { apiCalls } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiErrors";
import InventoryToolbar from "./InventoryToolbar";
import AddProductModal from "./AddProductModal";
import ActivityLogModal from "./ActivityLogModal";
import StockAdjustModal from "./StockAdjustModal";
import ProductTable from "./ProductTable";

export default function Inventory({ products, onRefreshData }) {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", sku: "", price: "", cost: "", stock: "", reorder: "", category: "" });
  const [stockLogs, setStockLogs] = useState([]);
  const [stockLogCount, setStockLogCount] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [adjustModal, setAdjustModal] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [logLoading, setLogLoading] = useState(false);
  const logRequestId = useRef(0);

  const filtered = (products || []).filter(
    (p) => p && (
      (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase())
    )
  );

  const normalizeLogPage = (data) => {
    if (Array.isArray(data)) {
      return {
        records: data,
        total: data.length,
        hasPagination: false,
      };
    }

    const records = Array.isArray(data?.results) ? data.results : [];
    return {
      records,
      total: Number.isFinite(Number(data?.count)) ? Number(data.count) : records.length,
      hasPagination: Boolean(data && "results" in data),
    };
  };

  const loadStockLogs = useCallback(async () => {
    const requestId = logRequestId.current + 1;
    logRequestId.current = requestId;
    setLogLoading(true);
    try {
      const pageSize = 200;
      const firstResponse = await apiCalls.getStockMovements({
        ordering: "-created_at",
        page_size: pageSize,
        page: 1,
      });
      const firstPage = normalizeLogPage(firstResponse.data);
      let allRecords = firstPage.records;
      let total = firstPage.total;

      if (firstPage.hasPagination && total > allRecords.length) {
        const pageCount = Math.ceil(total / pageSize);
        const remainingPages = Array.from({ length: pageCount - 1 }, (_, index) => index + 2);
        const pageResponses = await Promise.all(
          remainingPages.map((page) =>
            apiCalls.getStockMovements({
              ordering: "-created_at",
              page_size: pageSize,
              page,
            })
          )
        );

        pageResponses.forEach((response) => {
          const page = normalizeLogPage(response.data);
          allRecords = allRecords.concat(page.records);
          total = Math.max(total, page.total);
        });
      }

      if (requestId === logRequestId.current) {
        setStockLogs(allRecords);
        setStockLogCount(total);
      }
    } catch (err) {
      console.error("Unable to load inventory activity log:", getApiErrorMessage(err));
    } finally {
      if (requestId === logRequestId.current) {
        setLogLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStockLogs();
  }, [loadStockLogs]);

  const addProduct = async (e) => {
    e.preventDefault();
    setLoadingAction(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        barcode: "",
        category: form.category && !Number.isNaN(Number(form.category)) ? Number(form.category) : null,
        unit: "pc",
        selling_price: String(parseFloat(form.price) || 0),
        cost_price: String(parseFloat(form.cost) || 0),
        reorder_level: String(parseFloat(form.reorder) || 0),
        is_active: true,
      };

      const created = await apiCalls.createProduct(payload);
      const openingStock = parseFloat(form.stock) || 0;

      if (openingStock > 0) {
        await apiCalls.adjustStock({
          product: created.data.id,
          new_quantity: String(openingStock),
          reason: "Opening stock for new product",
        });
      }

      await onRefreshData?.();
      await loadStockLogs();
      setForm({ name: "", sku: "", price: "", cost: "", stock: "", reorder: "", category: "" });
      setShowAdd(false);
    } catch (err) {
      console.error("Unable to save product:", getApiErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const lines = ev.target.result.split("\n").filter(Boolean);
      const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const rows = lines
        .slice(1)
        .map((line) => {
          const vals = line.split(",");
          const obj = {};
          header.forEach((h, i) => (obj[h] = vals[i] ? vals[i].trim() : ""));
          return {
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

      setLoadingAction(true);
      try {
        for (const row of rows) {
          const created = await apiCalls.createProduct({
            name: row.name,
            sku: row.sku,
            barcode: "",
            category: row.category && !Number.isNaN(Number(row.category)) ? Number(row.category) : null,
            unit: "pc",
            selling_price: String(row.price),
            cost_price: String(row.cost),
            reorder_level: String(row.reorder),
            is_active: true,
          });
          if (row.stock > 0) {
            await apiCalls.adjustStock({
              product: created.data.id,
              new_quantity: String(row.stock),
              reason: "Opening stock from CSV import",
            });
          }
        }
        await onRefreshData?.();
        await loadStockLogs();
      } catch (err) {
        console.error("Unable to import CSV products:", getApiErrorMessage(err));
      } finally {
        setLoadingAction(false);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const openAdjust = (product, type) => {
    setAdjustModal({ product, type });
  };

  const confirmAdjust = async (product, type, qty) => {
    setLoadingAction(true);
    try {
      const delta = type === "add" ? qty : -qty;
      await apiCalls.adjustStock({
        product: product.id,
        delta: String(delta),
        reason: type === "add" ? "Manual stock addition" : "Manual stock removal",
      });
      await onRefreshData?.();
      await loadStockLogs();
      setAdjustModal(null);
    } catch (err) {
      console.error("Unable to adjust stock:", getApiErrorMessage(err));
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div>
      <InventoryToolbar
        search={search}
        setSearch={setSearch}
        onAddClick={() => setShowAdd(true)}
        onLogClick={() => {
          setShowLog(true);
          loadStockLogs();
        }}
        onCSVImport={handleCSV}
        logCount={stockLogCount}
      />

      <AddProductModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        form={form}
        setForm={setForm}
        onSubmit={addProduct}
        loading={loadingAction}
      />

      <ActivityLogModal
        show={showLog}
        onClose={() => setShowLog(false)}
        logs={stockLogs}
        logCount={stockLogCount}
        loading={logLoading}
        onRefreshLogs={loadStockLogs}
      />

      <StockAdjustModal
        product={adjustModal?.product ?? null}
        initialType={adjustModal?.type ?? "add"}
        onClose={() => setAdjustModal(null)}
        onConfirm={confirmAdjust}
        loading={loadingAction}
      />

      <ProductTable products={filtered} onAdjust={openAdjust} />
    </div>
  );
}

import { COLORS } from "../../constants/colors";

export default function InventoryToolbar({ search, setSearch, onAddClick, onLogClick, onCSVImport, logCount }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
      {/* Search */}
      <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
        <svg
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: COLORS.muted }}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          style={{
            width: "100%",
            padding: "10px 10px 10px 36px",
            border: "1px solid " + COLORS.border,
            borderRadius: 8,
            fontSize: 14,
            background: COLORS.card,
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Import CSV */}
      <button
        onClick={() => document.getElementById("csvInput").click()}
        style={{
          padding: "10px 16px",
          border: "1px solid " + COLORS.border,
          borderRadius: 8,
          background: COLORS.card,
          cursor: "pointer",
          fontSize: 14,
          color: COLORS.text,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Import CSV
      </button>
      <input id="csvInput" type="file" accept=".csv" onChange={onCSVImport} style={{ display: "none" }} />

      {/* Activity Log */}
      <button
        onClick={onLogClick}
        style={{
          padding: "10px 16px",
          border: "1px solid " + COLORS.border,
          borderRadius: 8,
          background: logCount > 0 ? COLORS.primaryLight : COLORS.card,
          cursor: "pointer",
          fontSize: 14,
          color: logCount > 0 ? COLORS.primaryDark : COLORS.text,
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: logCount > 0 ? 600 : 400,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        Activity Log {logCount > 0 && "(" + logCount + ")"}
      </button>

      {/* Add Product */}
      <button
        onClick={onAddClick}
        style={{
          padding: "10px 16px",
          border: "none",
          borderRadius: 8,
          background: COLORS.primary,
          color: "#fff",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add product
      </button>
    </div>
  );
}
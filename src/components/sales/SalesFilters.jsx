import { COLORS } from "../../constants/colors";

export default function SalesFilters({
  payFilter,
  setPayFilter,
  dateFilter,
  setDateFilter,
}) {
  const methods = ["All", "Cash", "Card", "GCash", "Maya"];

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        flexWrap: "wrap",
        marginBottom: 16,
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {methods.map((m) => (
          <button
            key={m}
            onClick={() => setPayFilter(m)}
            style={{
              padding: "8px 14px",
              border: `1.5px solid ${
                payFilter === m ? COLORS.primary : COLORS.border
              }`,
              borderRadius: 8,
              background:
                payFilter === m ? COLORS.primaryLight : COLORS.card,
              color:
                payFilter === m
                  ? COLORS.primaryDark
                  : COLORS.muted,
              fontSize: 13,
              fontWeight: payFilter === m ? 600 : 400,
              cursor: "pointer",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      <input
        type="date"
        value={dateFilter}
        onChange={(e) => setDateFilter(e.target.value)}
        style={{
          padding: "8px 12px",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          fontSize: 14,
          color: COLORS.text,
          background: COLORS.card,
        }}
      />

      {dateFilter && (
        <button
          onClick={() => setDateFilter("")}
          style={{
            padding: "8px 12px",
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            background: COLORS.card,
            cursor: "pointer",
            fontSize: 13,
            color: COLORS.muted,
          }}
        >
          Clear
        </button>
      )}
    </div>
  );
}
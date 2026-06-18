import { COLORS } from "../../constants/colors";

export default function MetricCard({ label, value, icon, color, bg }) {
  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 14,
        border: `1px solid ${COLORS.border}`,
        padding: "1.25rem",
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: COLORS.muted, marginBottom: 4 }}>{label}</p>
        <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: COLORS.text }}>{value}</p>
      </div>
    </div>
  );
}
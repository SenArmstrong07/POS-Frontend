import { COLORS } from "../../constants/colors";

export default function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 12px",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        marginBottom: 4,
        background: active ? "rgba(29,158,117,0.18)" : "transparent",
        color: active ? COLORS.primary : "rgba(255,255,255,0.6)",
        fontWeight: active ? 600 : 400,
        fontSize: 14,
        textAlign: "left",
        transition: "all 0.15s",
      }}
    >
      <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
      {label}
    </button>
  );
}
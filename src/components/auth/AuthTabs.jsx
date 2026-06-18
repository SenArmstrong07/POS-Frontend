import { COLORS } from "../../constants/colors";

export default function AuthTabs({ mode, onSwitch }) {
  return (
    <div
      style={{
        display: "flex",
        background: COLORS.faint,
        borderRadius: 10,
        padding: 4,
        marginBottom: "1.5rem",
      }}
    >
      {["login", "signup"].map((m) => (
        <button
          key={m}
          onClick={() => onSwitch(m)}
          style={{
            flex: 1,
            padding: "8px",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: mode === m ? 600 : 400,
            background: mode === m ? COLORS.card : "transparent",
            color: mode === m ? COLORS.primary : COLORS.muted,
            boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            transition: "all 0.2s",
          }}
        >
          {m === "login" ? "Sign in" : "Create account"}
        </button>
      ))}
    </div>
  );
}
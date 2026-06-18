import { COLORS } from "../../constants/colors";

export default function AuthHeader() {
  return (
    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
      <div
        style={{
          width: 52,
          height: 52,
          background: COLORS.primary,
          borderRadius: 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 12,
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: COLORS.text }}>LiteSpeedHost POS</h1>
      <p style={{ margin: "4px 0 0", color: COLORS.muted, fontSize: 14 }}>Faster than Amazon AWS</p>
    </div>
  );
}
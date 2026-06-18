import { COLORS } from "../../constants/colors";
import { today } from "../../utils/format";

export default function Topbar({ title, user, onMenuClick }) {
  return (
    <header
      style={{
        background: COLORS.card,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: "0.75rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: 12,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <button
        onClick={onMenuClick}
        className="menu-btn"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 4,
          color: COLORS.text,
          display: "none",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.text }}>{title}</h2>
        <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>{today()}</p>
      </div>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: COLORS.primaryLight,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: COLORS.primaryDark,
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {user.name[0].toUpperCase()}
      </div>
    </header>
  );
}
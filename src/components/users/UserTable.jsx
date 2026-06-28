import { COLORS } from "../../constants/colors";

const roleBadgeStyle = (role) => ({
  display: "inline-flex",
  alignItems: "center",
  fontSize: 12,
  fontWeight: 600,
  padding: "3px 10px",
  borderRadius: 6,
  background: role === "ADMIN" ? COLORS.primaryLight : COLORS.faint,
  color: role === "ADMIN" ? COLORS.primaryDark : COLORS.muted,
});

const statusBadgeStyle = (isActive) => ({
  display: "inline-flex",
  alignItems: "center",
  fontSize: 12,
  fontWeight: 600,
  padding: "3px 10px",
  borderRadius: 6,
  background: isActive ? "#eaf3de" : "#fef2f2",
  color: isActive ? COLORS.success : COLORS.danger,
});

const formatLastLogin = (value) => {
  if (!value) return "Never";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
};

export default function UserTable({ users, currentUserId, onEdit, onToggleActive, onDelete }) {
  if (!users || users.length === 0) {
    return (
      <div
        style={{
          background: COLORS.card,
          borderRadius: 14,
          border: `1px solid ${COLORS.border}`,
          padding: "2.5rem",
          textAlign: "center",
        }}
      >
        <p style={{ color: COLORS.muted, fontSize: 14, margin: 0 }}>No users found.</p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: COLORS.card,
        borderRadius: 14,
        border: `1px solid ${COLORS.border}`,
        padding: "0.5rem 1.25rem",
      }}
    >
      {users.map((u) => {
        const isSelf = u.id === currentUserId;
        return (
          <div
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              padding: "12px 0",
              borderBottom: `1px solid ${COLORS.faint}`,
              flexWrap: "wrap",
            }}
          >
            <div style={{ minWidth: 180, flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                {u.username}
                {isSelf && <span style={{ color: COLORS.muted, fontWeight: 400 }}> (you)</span>}
              </p>
              <p style={{ margin: 0, fontSize: 12, color: COLORS.muted }}>
                {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                {u.email ? ` · ${u.email}` : ""}
              </p>
            </div>

            <span style={roleBadgeStyle(u.role)}>{u.role === "ADMIN" ? "Admin" : "Cashier"}</span>
            <span style={statusBadgeStyle(u.is_active)}>{u.is_active ? "Active" : "Inactive"}</span>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => onEdit(u)}
                style={actionBtnStyle()}
                title="Edit user"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>

              <button
                onClick={() => onToggleActive(u)}
                disabled={isSelf}
                style={actionBtnStyle(isSelf)}
                title={isSelf ? "You can't deactivate your own account" : u.is_active ? "Deactivate" : "Activate"}
              >
                {u.is_active ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => onDelete(u)}
                disabled={isSelf}
                style={actionBtnStyle(isSelf, true)}
                title={isSelf ? "You can't delete your own account" : "Delete user"}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function actionBtnStyle(disabled = false, danger = false) {
  return {
    width: 30,
    height: 30,
    border: "1px solid " + COLORS.border,
    borderRadius: 7,
    background: disabled ? COLORS.faint : COLORS.card,
    cursor: disabled ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: disabled ? COLORS.muted : danger ? COLORS.danger : COLORS.text,
    opacity: disabled ? 0.5 : 1,
  };
}
import { COLORS } from "../../constants/colors";

const EMPTY_FORM = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  role: "CASHIER",
  password: "",
};

export { EMPTY_FORM as EMPTY_ADD_USER_FORM };

export default function AddUserModal({ show, onClose, form, setForm, onSubmit, loading = false, error = null }) {
  if (!show) return null;

  const handleCancel = () => {
    onClose();
    setForm(EMPTY_FORM);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
        padding: "1rem",
      }}
      onClick={() => !loading && onClose()}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.card,
          borderRadius: 16,
          border: "1px solid " + COLORS.border,
          width: "100%",
          maxWidth: 520,
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid " + COLORS.border,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: COLORS.primaryLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: COLORS.primary,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.text }}>New user</h3>
          </div>
          <button
            onClick={() => !loading && onClose()}
            style={{
              width: 32,
              height: 32,
              border: "none",
              borderRadius: 8,
              background: COLORS.faint,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: COLORS.muted,
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: COLORS.danger,
                border: `1px solid ${COLORS.danger}33`,
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: 13,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Username</label>
              <input
                required
                type="text"
                disabled={loading}
                value={form.username}
                onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                placeholder="e.g. jdoe"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>First name</label>
              <input
                type="text"
                disabled={loading}
                value={form.first_name}
                onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Last name</label>
              <input
                type="text"
                disabled={loading}
                value={form.last_name}
                onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))}
                style={inputStyle}
              />
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                disabled={loading}
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="e.g. jdoe@store.local"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Role</label>
              <select
                disabled={loading}
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                style={inputStyle}
              >
                <option value="CASHIER">Cashier</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                required
                type="password"
                disabled={loading}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                style={inputStyle}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid " + COLORS.faint,
            }}
          >
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: "11px 20px",
                background: loading ? COLORS.border : COLORS.primary,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving..." : "Save user"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              style={{
                padding: "11px 20px",
                background: COLORS.faint,
                color: COLORS.muted,
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const labelStyle = {
  fontSize: 12,
  color: COLORS.muted,
  fontWeight: 500,
  display: "block",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid " + COLORS.border,
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box",
  outline: "none",
  background: COLORS.card,
  color: COLORS.text,
};
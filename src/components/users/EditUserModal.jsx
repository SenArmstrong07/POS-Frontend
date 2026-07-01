import { useEffect, useState } from "react";
import { apiCalls } from "../../services/api";
import { getApiErrorMessage } from "../../utils/apiErrors";
import { COLORS } from "../../constants/colors";

export default function EditUserModal({
  show,
  user,
  currentUser,
  onClose,
  onSubmit,
  onVerifyAdminPassword,
  loading = false,
  error = null,
}) {
  const [form, setForm] = useState(null);
  const [passwordChangeEnabled, setPasswordChangeEnabled] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
    adminPassword: "",
  });
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmingPassword, setConfirmingPassword] = useState(false);

  // Reset local form state whenever a different user is opened for editing.
  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        role: user.role || "CASHIER",
        is_active: !!user.is_active,
      });
      setPasswordChangeEnabled(false);
      setPasswordForm({ newPassword: "", confirmPassword: "", adminPassword: "" });
      setShowPasswordConfirmation(false);
      setPasswordError("");
    } else {
      setForm(null);
    }
  }, [user]);

  if (!show || !user || !form) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordChangeEnabled) {
      onSubmit(user.id, form);
      return;
    }

    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Please enter and confirm the new password.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setShowPasswordConfirmation(true);
  };

  const handlePasswordConfirm = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (!passwordForm.adminPassword.trim()) {
      setPasswordError("Please enter the admin password.");
      return;
    }

    setConfirmingPassword(true);
    try {
      const verifyPassword = onVerifyAdminPassword || (async (adminPassword) => {
        if (!currentUser?.username) {
          throw new Error("No admin account is available for verification.");
        }
        await apiCalls.login(currentUser.username, adminPassword);
      });

      await verifyPassword(passwordForm.adminPassword);
      await onSubmit(user.id, {
        ...form,
        password: passwordForm.newPassword,
        adminPassword: passwordForm.adminPassword,
      });
      setPasswordForm({ newPassword: "", confirmPassword: "", adminPassword: "" });
      setPasswordChangeEnabled(false);
      setShowPasswordConfirmation(false);
    } catch (err) {
      setPasswordError(getApiErrorMessage(err, "Admin password verification failed."));
    } finally {
      setConfirmingPassword(false);
    }
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: COLORS.text }}>
              Edit {user.username}
            </h3>
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
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem" }}>
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

            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  color: COLORS.text,
                  cursor: loading ? "not-allowed" : "pointer",
                  paddingBottom: 11,
                }}
              >
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                Active account
              </label>
            </div>

            <div style={{ gridColumn: "1 / -1" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 14,
                  color: COLORS.text,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                <input
                  type="checkbox"
                  disabled={loading}
                  checked={passwordChangeEnabled}
                  onChange={(e) => {
                    setPasswordChangeEnabled(e.target.checked);
                    setPasswordError("");
                    setShowPasswordConfirmation(false);
                    setPasswordForm((prev) => ({ ...prev, adminPassword: "" }));
                  }}
                />
                Change password for this user
              </label>

              {passwordChangeEnabled && (
                <div
                  style={{
                    marginTop: 10,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid " + COLORS.border,
                    background: COLORS.faint,
                  }}
                >
                  <div style={{ display: "grid", gap: 10 }}>
                    <div>
                      <label htmlFor="new-password" style={labelStyle}>
                        New password
                      </label>
                      <input
                        id="new-password"
                        type="password"
                        disabled={loading || confirmingPassword}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                        }
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label htmlFor="confirm-password" style={labelStyle}>
                        Confirm new password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        disabled={loading || confirmingPassword}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                        }
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {showPasswordConfirmation && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 10,
                        border: "1px solid " + COLORS.border,
                        background: "#fff",
                      }}
                    >
                      <p style={{ margin: "0 0 10px", fontSize: 13, color: COLORS.text }}>
                        For security, enter the admin password before applying the reset.
                      </p>
                      <label htmlFor="admin-password" style={labelStyle}>
                        Admin password
                      </label>
                      <input
                        id="admin-password"
                        type="password"
                        disabled={loading || confirmingPassword}
                        value={passwordForm.adminPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({ ...prev, adminPassword: e.target.value }))
                        }
                        style={inputStyle}
                      />

                      {passwordError && (
                        <div
                          style={{
                            marginTop: 10,
                            background: "#fef2f2",
                            color: COLORS.danger,
                            border: `1px solid ${COLORS.danger}33`,
                            borderRadius: 8,
                            padding: "8px 10px",
                            fontSize: 12,
                          }}
                        >
                          {passwordError}
                        </div>
                      )}

                      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                        <button
                          type="button"
                          disabled={loading || confirmingPassword}
                          onClick={handlePasswordConfirm}
                          style={{
                            flex: 1,
                            padding: "10px 12px",
                            background: loading || confirmingPassword ? COLORS.border : COLORS.primary,
                            color: "#fff",
                            border: "none",
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: loading || confirmingPassword ? "not-allowed" : "pointer",
                          }}
                        >
                          {confirmingPassword ? "Verifying..." : "Confirm password change"}
                        </button>
                        <button
                          type="button"
                          disabled={loading || confirmingPassword}
                          onClick={() => {
                            setShowPasswordConfirmation(false);
                            setPasswordError("");
                          }}
                          style={{
                            padding: "10px 12px",
                            background: COLORS.faint,
                            color: COLORS.muted,
                            border: "none",
                            borderRadius: 8,
                            fontSize: 13,
                            cursor: loading || confirmingPassword ? "not-allowed" : "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              disabled={loading || confirmingPassword}
              style={{
                flex: 1,
                padding: "11px 20px",
                background: loading || confirmingPassword ? COLORS.border : COLORS.primary,
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading || confirmingPassword ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Saving..." : passwordChangeEnabled ? "Save changes" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => !loading && onClose()}
              disabled={loading || confirmingPassword}
              style={{
                padding: "11px 20px",
                background: COLORS.faint,
                color: COLORS.muted,
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                cursor: loading || confirmingPassword ? "not-allowed" : "pointer",
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
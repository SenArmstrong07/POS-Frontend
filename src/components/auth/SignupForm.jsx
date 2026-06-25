import { useState } from "react";

export default function SignupForm({ onSubmit, error, loading }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [focused, setFocused] = useState(null);
  const [localErr, setLocalErr] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalErr("");

    if (!form.name.trim()) { setLocalErr("Name is required."); return; }
    if (!form.email.includes("@")) { setLocalErr("Enter a valid email."); return; }
    if (form.password.length < 4) { setLocalErr("Password too short."); return; }
    if (form.password !== form.confirm) { setLocalErr("Passwords do not match."); return; }

    onSubmit(form.name, form.email, form.password);
  };

  const displayError = localErr || error;

  const fields = [
    {
      key: "name",
      label: "Full name",
      type: "text",
      placeholder: "Juan dela Cruz",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 1 0-16 0" />
        </svg>
      ),
      delay: "0.1s",
    },
    {
      key: "email",
      label: "Email address",
      type: "email",
      placeholder: "you@business.com",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="M22 4L12 13 2 4" />
        </svg>
      ),
      delay: "0.18s",
    },
    {
      key: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a password",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
      delay: "0.26s",
    },
    {
      key: "confirm",
      label: "Confirm password",
      type: "password",
      placeholder: "Re-enter your password",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      delay: "0.34s",
    },
  ];

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((f) => (
        <div
          key={f.key}
          style={{
            marginBottom: 20,
            animation: `fieldEnter 0.5s cubic-bezier(0.16,1,0.3,1) ${f.delay} both`,
          }}
        >
          <label style={styles.label}>{f.label}</label>
          <div style={{ position: "relative" }}>
            <span
              style={{
                ...styles.inputIcon,
                color: focused === f.key ? "#1d9e75" : "rgba(255,255,255,0.15)",
                filter: focused === f.key ? "drop-shadow(0 0 6px rgba(29,158,117,0.4))" : "none",
              }}
            >
              {f.icon}
            </span>
            <input
              type={f.type}
              required
              value={form[f.key]}
              onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              onFocus={() => setFocused(f.key)}
              onBlur={() => setFocused(null)}
              placeholder={f.placeholder}
              style={{
                ...styles.input,
                borderColor: focused === f.key
                  ? "rgba(29,158,117,0.5)"
                  : "rgba(255,255,255,0.06)",
                background: focused === f.key
                  ? "rgba(29,158,117,0.04)"
                  : "rgba(255,255,255,0.025)",
                boxShadow: focused === f.key
                  ? "0 0 0 3px rgba(29,158,117,0.08), 0 0 30px rgba(29,158,117,0.05), inset 0 1px 0 rgba(255,255,255,0.03)"
                  : "inset 0 1px 0 rgba(255,255,255,0.02)",
              }}
            />
          </div>
        </div>
      ))}

      {displayError && (
        <div style={styles.errorBox}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {displayError}
        </div>
      )}

      <button type="submit" disabled={loading} className="auth-submit-btn" style={{
        ...styles.button,
        opacity: loading ? 0.7 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}>
        <span style={{ position: "relative", zIndex: 2 }}>
          {loading ? "Creating account..." : "Create account"}
        </span>
      </button>
    </form>
  );
}

const styles = {
  label: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    fontWeight: 600,
    display: "block",
    marginBottom: 8,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    transition: "color 0.3s ease, filter 0.3s ease",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "14px 14px 14px 46px",
    border: "1.5px solid rgba(255,255,255,0.06)",
    borderRadius: 12,
    fontSize: 14,
    color: "rgba(255,255,255,0.92)",
    outline: "none",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    fontFamily: "inherit",
    fontWeight: 400,
  },
  errorBox: {
    color: "#f87171",
    fontSize: 13,
    margin: "0 0 18px",
    padding: "11px 14px",
    background: "rgba(248,113,113,0.06)",
    borderRadius: 12,
    border: "1px solid rgba(248,113,113,0.12)",
    display: "flex",
    alignItems: "center",
    gap: 8,
    animation: "errorShake 0.4s ease",
    backdropFilter: "blur(10px)",
  },
  button: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #1d9e75 0%, #17b890 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    marginTop: 6,
    position: "relative",
    zIndex: 1,
    letterSpacing: "0.4px",
    transition: "transform 0.2s ease, box-shadow 0.3s ease",
    animation: "fieldEnter 0.5s cubic-bezier(0.16,1,0.3,1) 0.42s both",
  },
};
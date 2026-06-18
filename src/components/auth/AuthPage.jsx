import { useState } from "react";
import { COLORS } from "../../constants/colors";
import AuthHeader from "./AuthHeader";
import AuthTabs from "./AuthTabs";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");

  const handle = (e) => {
    e.preventDefault();
    setErr("");
    if (mode === "signup") {
      if (!form.name.trim()) return setErr("Name is required.");
      if (form.password !== form.confirm) return setErr("Passwords do not match.");
    }
    if (!form.email.includes("@")) return setErr("Enter a valid email.");
    if (form.password.length < 4) return setErr("Password too short.");
    onLogin({ name: form.name || form.email.split("@")[0], email: form.email });
  };

  const switchMode = (m) => {
    setMode(m);
    setErr("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `linear-gradient(135deg, ${COLORS.primaryLight} 0%, #ffffff 60%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <AuthHeader />

        <div
          style={{
            background: COLORS.card,
            borderRadius: 16,
            border: `1px solid ${COLORS.border}`,
            padding: "2rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <AuthTabs mode={mode} onSwitch={switchMode} />

          {mode === "login" ? (
            <LoginForm form={form} setForm={setForm} error={err} onSubmit={handle} />
          ) : (
            <SignupForm form={form} setForm={setForm} error={err} onSubmit={handle} />
          )}

          <p style={{ textAlign: "center", fontSize: 12, color: COLORS.muted, marginTop: "1rem", marginBottom: 0 }}>
            Basta may @gmail.com at 4 char pass<br />
          </p>
        </div>
      </div>
    </div>
  );
}
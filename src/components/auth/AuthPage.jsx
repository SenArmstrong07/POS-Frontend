import { useState } from "react";
import { COLORS } from "../../constants/colors";
import { apiCalls } from "../../services/api";
import AuthHeader from "./AuthHeader";
import AuthTabs from "./AuthTabs";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(false); //{ name: "", email: "", password: "", confirm: "" }
  const [err, setErr] = useState(null); //""
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoginSubmit = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCalls.login(username, password);
      console.log("Login response:", response.data); // Debug log
      
      // Handle different token response formats
      const token = response.data.access || response.data.token || response.data.access_token;
      const userId = response.data.user_id || response.data.id || response.data.user?.id;
      
      if (!token) {
        throw new Error("No token in login response");
      }
      
      localStorage.setItem("auth_token", token);
      onLogin({ 
        username, 
        name: username,
        email: response.data.email || `${username}@posapp.local`,
        id: response.data.user_id || response.data.id 
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCalls.signup({ name, email, password });
      localStorage.setItem("auth_token", response.data.token);
      onLogin({ name, email, id: response.data.user_id });
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

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
    setError("");
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

          {/* {mode === "login" ? (
            <LoginForm form={form} setForm={setForm} error={err} onSubmit={handle} />
          ) : (
            <SignupForm form={form} setForm={setForm} error={err} onSubmit={handle} />
          )} */}
          {error && <div className="error" style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          {mode === "login" && (
            <LoginForm onSubmit={handleLoginSubmit} loading={loading} error={error} />
          )}
          {mode === "signup" && (
            <SignupForm onSubmit={handleSignupSubmit} loading={loading} error={error} />
          )}

          <p style={{ textAlign: "center", fontSize: 12, color: COLORS.muted, marginTop: "1rem", marginBottom: 0 }}>
            Basta may @gmail.com at 4 char pass<br />
          </p>
        </div>
      </div>
    </div>
  );
}
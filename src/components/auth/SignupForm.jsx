import { useState } from "react";
import { COLORS } from "../../constants/colors";
import InputField from "../ui/InputField";

export default function SignupForm({ onSubmit, error, loading }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name.trim()) {
      alert("Name is required.");
      return;
    }
    if (!form.email.includes("@")) {
      alert("Enter a valid email.");
      return;
    }
    if (form.password.length < 4) {
      alert("Password too short.");
      return;
    }
    if (form.password !== form.confirm) {
      alert("Passwords do not match.");
      return;
    }

    onSubmit(form.name, form.email, form.password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Full name"
        value={form.name}
        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
        placeholder="Juan dela Cruz"
      />
      <InputField
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
        placeholder="you@business.com"
      />
      <InputField
        label="Password"
        type="password"
        value={form.password}
        onChange={(v) => setForm((f) => ({ ...f, password: v }))}
        placeholder="••••••••"
      />
      <InputField
        label="Confirm password"
        type="password"
        value={form.confirm}
        onChange={(v) => setForm((f) => ({ ...f, confirm: v }))}
        placeholder="••••••••"
      />
      {error && (
        <p
          style={{
            color: COLORS.danger,
            fontSize: 13,
            margin: "0 0 12px",
            padding: "8px 12px",
            background: "#fef2f2",
            borderRadius: 8,
          }}
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: COLORS.primary,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
          marginTop: 4,
        }}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
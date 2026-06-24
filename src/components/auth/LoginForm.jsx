import { useState } from "react";
import { COLORS } from "../../constants/colors";
import InputField from "../ui/InputField";

export default function LoginForm({ onSubmit, error, loading }) {
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form.username, form.password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputField
        label="Username"
        type="text"
        value={form.username}
        onChange={(v) => setForm((f) => ({ ...f, username: v }))}
        placeholder="admin"
      />
      <InputField
        label="Password"
        type="password"
        value={form.password}
        onChange={(v) => setForm((f) => ({ ...f, password: v }))}
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
        {loading ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
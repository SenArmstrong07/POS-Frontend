import { COLORS } from "../../constants/colors";
import InputField from "../ui/InputField";

export default function LoginForm({ form, setForm, error, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
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
        style={{
          width: "100%",
          padding: "12px",
          background: COLORS.primary,
          color: "#fff",
          border: "none",
          borderRadius: 10,
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          marginTop: 4,
        }}
      >
        Sign in
      </button>
    </form>
  );
}
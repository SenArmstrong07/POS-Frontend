import { COLORS } from "../../constants/colors";

export default function InputField({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: COLORS.text, marginBottom: 6 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "10px 12px",
          border: `1px solid ${COLORS.border}`,
          borderRadius: 8,
          fontSize: 14,
          outline: "none",
          boxSizing: "border-box",
          color: COLORS.text,
          background: "#fff",
        }}
      />
    </div>
  );
}
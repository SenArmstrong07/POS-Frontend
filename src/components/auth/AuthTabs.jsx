export default function AuthTabs({ mode, onSwitch }) {
  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.indicator,
          left: mode === "login" ? 3 : "calc(50% + 1px)",
        }}
      />
      {["login", "signup"].map((m) => (
        <button
          key={m}
          onClick={() => onSwitch(m)}
          style={{
            ...styles.tab,
            color:
              mode === m
                ? "rgba(29,158,117,0.95)"
                : "rgba(255,255,255,0.3)",
            fontWeight: mode === m ? 600 : 400,
            textShadow: mode === m ? "0 0 20px rgba(29,158,117,0.3)" : "none",
          }}
        >
          {m === "login" ? "Sign in" : "Create account"}
        </button>
      ))}
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    position: "relative",
    background: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    padding: 3,
    marginBottom: "1.75rem",
    border: "1px solid rgba(255,255,255,0.05)",
    animation: "fadeUp 0.5s ease 0.4s both",
  },
  indicator: {
    position: "absolute",
    top: 3,
    bottom: 3,
    width: "calc(50% - 4px)",
    background: "rgba(29,158,117,0.1)",
    borderRadius: 9,
    border: "1px solid rgba(29,158,117,0.2)",
    transition: "left 0.45s cubic-bezier(0.16,1,0.3,1)",
    boxShadow: "0 0 25px rgba(29,158,117,0.08)",
  },
  tab: {
    flex: 1,
    padding: "10px 8px",
    border: "none",
    borderRadius: 9,
    cursor: "pointer",
    fontSize: 14,
    background: "transparent",
    position: "relative",
    zIndex: 1,
    transition: "color 0.3s ease, font-weight 0.3s ease, text-shadow 0.3s ease",
  },
};
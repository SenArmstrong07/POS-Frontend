// auth/AuthHeader.jsx
export default function AuthHeader() {
  return (
    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
      <h1 style={styles.title}>LiteSpeedHost POS</h1>
      <p style={styles.subtitle}>Faster than Amazon AWS</p>
    </div>
  );
}

const styles = {
  title: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "rgba(255,255,255,0.95)",
    letterSpacing: "-0.6px",
    animation: "fadeUp 0.6s ease 0.35s both",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: "0.5px",
    animation: "fadeUp 0.6s ease 0.5s both",
  },
};
import { useState, useRef, useCallback } from "react";
import { apiCalls } from "../../services/api";
import AuthHeader from "./AuthHeader";
import AuthTabs from "./AuthTabs";
import LoginForm from "./LoginForm";
import SignupForm from "./SignupForm";
import LoadingScreen from "./LoadingScreen";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingScreen, setLoadingScreen] = useState(false);

  const pendingUserRef = useRef(null);

  const handleLoadingComplete = useCallback(() => {
    if (pendingUserRef.current) {
      onLogin(pendingUserRef.current);
      pendingUserRef.current = null;
    }
  }, [onLogin]);

  const handleLoginSubmit = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCalls.login(username, password);
      console.log("Login response:", response.data);

      const token = response.data.access || response.data.token || response.data.access_token;

      if (!token) {
        throw new Error("No token in login response");
      }

      localStorage.setItem("auth_token", token);

      const user = {
        username,
        name: username,
        email: response.data.email || `${username}@posapp.local`,
        id: response.data.user_id || response.data.id || response.data.user?.id,
      };

      pendingUserRef.current = user;
      setLoadingScreen(true);
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || err.message || "Login failed");
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCalls.signup({ name, email, password });
      localStorage.setItem("auth_token", response.data.token);

      const user = {
        name,
        email,
        id: response.data.user_id,
      };

      pendingUserRef.current = user;
      setLoadingScreen(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError(null);
  };

  return (
    <div className="auth-page">
      {/* Animated gradient orbs */}
      <div className="auth-orb-layer">
        <div className="auth-orb auth-orb--green" />
        <div className="auth-orb auth-orb--purple" />
        <div className="auth-orb auth-orb--teal" />
        <div className="auth-orb auth-orb--pink" />
      </div>

      {/* Grid lines */}
      <div className="auth-grid-layer">
        {Array.from({ length: 12 }, (_, i) => {
          const horizontal = i % 2 === 0;
          const pos = 8 + (i / 12) * 84;
          return (
            <div
              key={i}
              className="auth-grid-line"
              style={
                horizontal
                  ? { top: `${pos}%`, left: 0, right: 0, height: 1 }
                  : { left: `${pos}%`, top: 0, bottom: 0, width: 1 }
              }
            />
          );
        })}
      </div>

      {/* Floating particles */}
      <div className="auth-particle-layer">
        {Array.from({ length: 40 }, (_, i) => {
          const left = (i * 17.3) % 100;
          const top = (i * 23.7) % 100;
          const size = 3 + (i % 6);
          const delay = (i * 0.73) % 8;
          const duration = 8 + (i % 14);
          const opacity = 0.2 + ((i * 0.013) % 0.4);
          return (
            <div
              key={i}
              className="auth-particle"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
                opacity,
              }}
            />
          );
        })}
      </div>

      {/* Grain texture */}
      <div className="auth-grain" />

      {/* Content */}
      <div style={styles.cardOuter}>
        <AuthHeader />

        <div style={styles.card}>
          <AuthTabs mode={mode} onSwitch={switchMode} />

          <div key={mode} className="auth-form-enter">
            {mode === "login" ? (
              <LoginForm onSubmit={handleLoginSubmit} loading={loading} error={error} />
            ) : (
              <SignupForm onSubmit={handleSignupSubmit} loading={loading} error={error} />
            )}
          </div>

          <p style={styles.footer}>Basta may @gmail.com at 4 char pass</p>
        </div>
      </div>

      {/* Loading overlay sits on top of everything */}
      {loadingScreen && <LoadingScreen onComplete={handleLoadingComplete} />}

      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          background: #050509 !important;
          min-height: 100vh;
        }
        #root {
          background: #050509;
        }
        input::placeholder {
          color: rgba(255,255,255,0.18) !important;
        }

        .auth-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: #050509;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: fixed;
          inset: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .auth-orb-layer {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }
        .auth-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          will-change: transform;
        }
        .auth-orb--green {
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(29,158,117,0.40) 0%, transparent 70%);
          top: -20%; left: -15%;
          animation: orbDrift1 18s ease-in-out infinite;
        }
        .auth-orb--purple {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(120,50,200,0.30) 0%, transparent 70%);
          top: 45%; right: -12%;
          animation: orbDrift2 22s ease-in-out infinite;
        }
        .auth-orb--teal {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(20,140,180,0.25) 0%, transparent 70%);
          bottom: -15%; left: 30%;
          animation: orbDrift3 16s ease-in-out infinite;
        }
        .auth-orb--pink {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(200,50,120,0.18) 0%, transparent 70%);
          top: 10%; right: 15%;
          animation: orbDrift4 20s ease-in-out infinite;
        }

        .auth-grid-layer {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.035;
        }
        .auth-grid-line {
          position: absolute;
          background: rgba(255,255,255,0.6);
        }

        .auth-particle-layer {
          position: fixed;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 2;
        }
        .auth-particle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 60%, transparent 100%);
          will-change: transform, opacity;
          animation: particleDrift linear infinite;
        }

        .auth-grain {
          position: fixed;
          inset: 0;
          z-index: 3;
          pointer-events: none;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 256px;
        }

        .auth-form-enter {
          animation: formSlideIn 0.45s cubic-bezier(0.16,1,0.3,1) both;
        }

        .auth-submit-btn {
          position: relative;
          overflow: hidden;
        }
        .auth-submit-btn::before {
          content: '';
          position: absolute;
          top: -2px; left: -2px; right: -2px; bottom: -2px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1d9e75, #5832b4, #1d9e75);
          background-size: 300% 300%;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.4s ease;
          animation: gradientRotate 4s linear infinite;
        }
        .auth-submit-btn:hover::before {
          opacity: 1;
        }
        .auth-submit-btn::after {
          content: '';
          position: absolute;
          top: 0;
          left: -120%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          animation: shimmer 3s ease-in-out infinite;
        }
        .auth-submit-btn:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 32px rgba(29,158,117,0.4), 0 0 60px rgba(29,158,117,0.12) !important;
        }
        .auth-submit-btn:active {
          transform: translateY(0) scale(0.98) !important;
        }

        @keyframes orbDrift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%      { transform: translate(80px, -100px) scale(1.15); }
          50%      { transform: translate(-60px, 60px) scale(0.9); }
          75%      { transform: translate(100px, 30px) scale(1.08); }
        }
        @keyframes orbDrift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(-90px, 80px) scale(1.2); }
          66%      { transform: translate(70px, -60px) scale(0.85); }
        }
        @keyframes orbDrift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%      { transform: translate(50px, 80px) scale(0.9); }
          50%      { transform: translate(-80px, -40px) scale(1.15); }
          75%      { transform: translate(40px, -70px) scale(1); }
        }
        @keyframes orbDrift4 {
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
          50%      { transform: translate(-50px, 50px) scale(1.1) rotate(10deg); }
        }
        @keyframes particleDrift {
          0%   { transform: translateY(0) translateX(0) scale(1); }
          25%  { transform: translateY(-60px) translateX(30px) scale(1.2); }
          50%  { transform: translateY(-30px) translateX(-20px) scale(0.8); }
          75%  { transform: translateY(-90px) translateX(15px) scale(1.1); }
          100% { transform: translateY(0) translateX(0) scale(1); }
        }
        @keyframes formSlideIn {
          from { opacity: 0; transform: translateY(20px); filter: blur(3px); }
          to   { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes shimmer {
          0%   { left: -120%; }
          100% { left: 200%; }
        }
        @keyframes gradientRotate {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes logoGlow {
          0%, 100% { box-shadow: 0 0 24px rgba(29,158,117,0.3), 0 0 80px rgba(29,158,117,0.08); }
          50%      { box-shadow: 0 0 40px rgba(29,158,117,0.5), 0 0 100px rgba(29,158,117,0.18); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeScale {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes fieldEnter {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          15%      { transform: translateX(-8px); }
          30%      { transform: translateX(8px); }
          45%      { transform: translateX(-5px); }
          60%      { transform: translateX(5px); }
          75%      { transform: translateX(-2px); }
          90%      { transform: translateX(2px); }
        }
        @keyframes borderPulse {
          0%, 100% { border-color: rgba(255,255,255,0.05); }
          50%      { border-color: rgba(29,158,117,0.12); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  cardOuter: {
    width: "100%",
    maxWidth: 430,
    position: "relative",
    zIndex: 10,
    animation: "fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) forwards",
  },
  card: {
    background: "rgba(12,12,20,0.65)",
    backdropFilter: "blur(30px) saturate(1.3)",
    WebkitBackdropFilter: "blur(30px) saturate(1.3)",
    borderRadius: 22,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "2rem",
    boxShadow: "0 30px 80px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.1) inset",
    animation: "borderPulse 6s ease-in-out infinite, cardFloat 8s ease-in-out 1s infinite",
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "rgba(255,255,255,0.15)",
    marginTop: "1.25rem",
    marginBottom: 0,
    letterSpacing: "0.2px",
  },
};
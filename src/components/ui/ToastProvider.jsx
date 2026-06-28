import { useCallback, useEffect, useRef, useState } from "react";
import { COLORS } from "../../constants/colors";
import { subscribeToToasts } from "../../utils/toast";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  const dismiss = useCallback((id) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  useEffect(() => {
    const timers = timersRef.current;
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((current) => [...current, toast].slice(-4));

      const timer = window.setTimeout(() => {
        dismiss(toast.id);
      }, toast.duration);

      timers.set(toast.id, timer);
    });

    return () => {
      unsubscribe();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, [dismiss]);

  return (
    <>
      {children}
      <div style={styles.region} aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => {
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";
          const accent = isError ? COLORS.danger : isSuccess ? COLORS.primary : COLORS.info;

          return (
            <div key={toast.id} style={styles.toast}>
              <div style={{ ...styles.icon, color: accent, borderColor: accent }}>
                {isError ? "!" : isSuccess ? "✓" : "i"}
              </div>
              <p style={styles.message}>{toast.message}</p>
              {toast.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    toast.onAction?.();
                    dismiss(toast.id);
                  }}
                  style={{ ...styles.action, color: accent }}
                >
                  {toast.actionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                style={styles.close}
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastSlideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

const styles = {
  region: {
    position: "fixed",
    left: "50%",
    bottom: 24,
    transform: "translateX(-50%)",
    zIndex: 200,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    width: "min(500px, calc(100vw - 28px))",
    pointerEvents: "none",
  },
  toast: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    maxWidth: "100%",
    minHeight: 42,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 999,
    padding: "8px 11px 8px 12px",
    background: "rgba(26,31,46,0.96)",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    boxShadow: "0 20px 54px rgba(15,23,42,0.28), 0 1px 0 rgba(255,255,255,0.08) inset",
    pointerEvents: "auto",
    animation: "toastSlideUp 180ms ease-out",
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "1.75px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
    flexShrink: 0,
  },
  message: {
    margin: 0,
    color: "rgba(255,255,255,0.94)",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.25,
    minWidth: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  action: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 700,
    padding: "2px 0",
    marginLeft: 6,
    flexShrink: 0,
  },
  close: {
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.82)",
    cursor: "pointer",
    fontSize: 22,
    lineHeight: 1,
    padding: "0 3px",
    borderRadius: 999,
    flexShrink: 0,
  },
};

const listeners = new Set();

export function subscribeToToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function showToast(toast) {
  const payload = {
    id: `${Date.now()}-${Math.random()}`,
    type: toast.type || "info",
    message: toast.message || "",
    duration: toast.duration ?? 4200,
    actionLabel: toast.actionLabel || "",
    onAction: typeof toast.onAction === "function" ? toast.onAction : null,
  };

  listeners.forEach((listener) => listener(payload));
  return payload.id;
}

export function showSuccessToast(message, options = {}) {
  return showToast({ ...options, type: "success", message });
}

export function showErrorToast(message, options = {}) {
  return showToast({ ...options, type: "error", message });
}

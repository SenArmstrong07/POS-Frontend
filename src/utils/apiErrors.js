export function getApiErrorMessage(err, fallback = "Something went wrong.") {
  const data = err?.response?.data;

  if (!data) return err?.message || fallback;
  if (typeof data === "string") return data;
  if (data.detail) return String(data.detail);

  const errors = data.errors || data;
  if (errors && typeof errors === "object") {
    const firstKey = Object.keys(errors)[0];
    const firstValue = errors[firstKey];
    if (Array.isArray(firstValue)) return `${firstKey}: ${firstValue.join(", ")}`;
    if (firstValue) return `${firstKey}: ${firstValue}`;
  }

  return fallback;
}

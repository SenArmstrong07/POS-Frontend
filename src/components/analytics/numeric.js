// src/components/reports/numeric.js
// DRF DecimalField serializes as a string ("1234.50"), and Plotly needs raw
// numbers for chart math/axes. fmt() (utils/format.js) handles all display
// formatting — this helper is only for chart data arrays.
export const num = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const n = typeof val === "number" ? val : parseFloat(val);
  return Number.isFinite(n) ? n : 0;
};
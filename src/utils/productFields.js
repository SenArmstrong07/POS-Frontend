export const parseNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getProductId = (product) => product?.id ?? product?.product;

export const getProductPrice = (product) =>
  parseNumber(
    product?.selling_price ??
      product?.price ??
      product?.unit_price ??
      product?.price_per_unit,
    0
  );

export const getProductCost = (product) =>
  parseNumber(product?.cost_price ?? product?.cost ?? product?.unit_cost, 0);

export const getProductStock = (product) =>
  parseNumber(product?.quantity_on_hand ?? product?.stock, 0);

export const getProductReorderLevel = (product) =>
  parseNumber(product?.reorder_level ?? product?.reorder, 0);

export const isProductLowStock = (product) => {
  if (typeof product?.is_low_stock === "boolean") return product.is_low_stock;
  return getProductStock(product) <= getProductReorderLevel(product);
};

export const getProductCategoryLabel = (product) =>
  product?.category_name || product?.category || product?.cat_id || "General";

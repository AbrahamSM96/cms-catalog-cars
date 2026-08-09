/**
 * Format number with thousand separators
 * @param num - Number to format
 * @returns Formatted string (e.g., 25,000)
 */
export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null) return "0";
  return num.toLocaleString("en-US");
}

/**
 * Format price with currency
 * @param price - Price to format
 * @param currency - Currency symbol (default: $)
 * @returns Formatted string (e.g., $25,000)
 */
export function formatPrice(price: number | undefined | null, currency = "$"): string {
  if (price === undefined || price === null) return `${currency}0`;
  return `${currency}${price.toLocaleString("en-US")}`;
}

/**
 * Format mileage with unit
 * @param mileage - Mileage to format
 * @param unit - Unit label (default: km)
 * @returns Formatted string (e.g., 150,000 km)
 */
export function formatMileage(mileage: number | undefined | null, unit = "km"): string {
  if (mileage === undefined || mileage === null) return `0 ${unit}`;
  return `${mileage.toLocaleString("en-US")} ${unit}`;
}

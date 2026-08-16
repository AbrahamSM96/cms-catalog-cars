/**
 * Format a price as Mexican pesos using the es-MX locale.
 *
 * @param price - the price in MXN
 */
export function formatPriceMXN(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    currency: 'MXN',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(price)
}

/**
 * Facebook Marketplace (Vehicles) helpers.
 *
 * Single source of truth for the select options used BOTH by the Payload
 * collection (Cars.ts) and by the admin "Copiar para Facebook Marketplace"
 * panel, so the copyable values always match Facebook's dropdowns.
 */

export interface Option {
  label: string;
  value: string;
}

// Facebook "Vehicle type"
export const VEHICLE_TYPE_OPTIONS: Option[] = [
  { label: "Auto", value: "car" },
  { label: "Camioneta", value: "truck" },
];

// Facebook "Body style"
export const BODY_TYPE_OPTIONS: Option[] = [
  { label: "Coupé", value: "coupe" },
  { label: "Camioneta", value: "truck" },
  { label: "Sedán", value: "sedan" },
  { label: "Hatchback", value: "hatchback" },
  { label: "SUV", value: "suv" },
  { label: "Convertible", value: "convertible" },
  { label: "Familiar", value: "wagon" },
  { label: "Minivan", value: "minivan" },
  { label: "Auto pequeño", value: "small-car" },
];

// Facebook "Vehicle condition"
export const CONDITION_OPTIONS: Option[] = [
  { label: "Excelente", value: "excellent" },
  { label: "Muy bueno", value: "very-good" },
  { label: "Bueno", value: "good" },
  { label: "Aceptable", value: "fair" },
  { label: "Malo", value: "poor" },
];

// Colors are managed in the "colors" collection (Spanish names), not a fixed
// list, so they are passed through as plain strings — see MarketplaceValues.

// Facebook "Fuel type" (matches existing Cars.fuelType values)
export const FUEL_TYPE_OPTIONS: Option[] = [
  { label: "Gasolina", value: "gasoline" },
  { label: "Diésel", value: "diesel" },
  { label: "Eléctrico", value: "electric" },
  { label: "Híbrido", value: "hybrid" },
  { label: "Híbrido Enchufable", value: "plug-in-hybrid" },
];

// Facebook "Transmission" (matches existing Cars.transmission values)
export const TRANSMISSION_OPTIONS: Option[] = [
  { label: "Automática", value: "automatic" },
  { label: "Manual", value: "manual" },
];

/** Resolve the human label for a stored select value. */
export function labelFor(options: Option[], value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  const match = options.find((o) => o.value === value);
  return match ? match.label : String(value);
}

const numberFmt = new Intl.NumberFormat("en-US");

export function formatKm(mileage: unknown): string {
  const n = typeof mileage === "number" ? mileage : Number(mileage);
  if (!n || Number.isNaN(n)) return "";
  return `${numberFmt.format(n)} km`;
}

export function formatPrice(price: unknown): string {
  const n = typeof price === "number" ? price : Number(price);
  if (!n || Number.isNaN(n)) return "";
  return `$${numberFmt.format(n)}`;
}

/**
 * Shape of the values the marketplace helpers read. Kept loose so it works
 * with both a saved Car doc and live Payload form values.
 */
export interface MarketplaceValues {
  vehicleType?: string;
  year?: number | string;
  brandName?: string;
  model?: string;
  mileage?: number | string;
  price?: number | string;
  bodyType?: string;
  /** Color name in Spanish (resolved from the colors collection). */
  exteriorColor?: string;
  /** Color name in Spanish (resolved from the colors collection). */
  interiorColor?: string;
  condition?: string;
  fuelType?: string;
  transmission?: string;
  city?: string;
  state?: string;
  features?: string[];
}

export interface MarketplaceField {
  key: string;
  label: string;
  /** Human value ready to paste into Facebook. Empty string = missing data. */
  value: string;
}

/**
 * Build the ordered list of Facebook Marketplace fields with copy-ready values.
 * The order mirrors Facebook's vehicle listing form.
 */
export function buildMarketplaceFields(v: MarketplaceValues): MarketplaceField[] {
  const location = [v.city, v.state].filter(Boolean).join(", ");

  return [
    { key: "vehicleType", label: "Tipo de vehículo", value: labelFor(VEHICLE_TYPE_OPTIONS, v.vehicleType) },
    { key: "year", label: "Año", value: v.year ? String(v.year) : "" },
    { key: "brand", label: "Marca", value: v.brandName || "" },
    { key: "model", label: "Modelo", value: v.model || "" },
    { key: "mileage", label: "Kilometraje", value: formatKm(v.mileage) },
    { key: "price", label: "Precio", value: formatPrice(v.price) },
    { key: "bodyType", label: "Carrocería", value: labelFor(BODY_TYPE_OPTIONS, v.bodyType) },
    { key: "exteriorColor", label: "Color exterior", value: v.exteriorColor || "" },
    { key: "interiorColor", label: "Color interior", value: v.interiorColor || "" },
    { key: "condition", label: "Estado del vehículo", value: labelFor(CONDITION_OPTIONS, v.condition) },
    { key: "fuelType", label: "Combustible", value: labelFor(FUEL_TYPE_OPTIONS, v.fuelType) },
    { key: "transmission", label: "Transmisión", value: labelFor(TRANSMISSION_OPTIONS, v.transmission) },
    { key: "location", label: "Ubicación", value: location },
  ];
}

/**
 * Template-based description generator for the free-text Facebook field.
 *
 * NOTE: This is the deterministic baseline. To upgrade to an LLM-written
 * description later, swap the call site to hit a server endpoint that calls
 * Claude and falls back to this function on error. See buildMarketplaceFields
 * for the structured data an LLM prompt would receive.
 */
export function buildMarketplaceDescription(v: MarketplaceValues): string {
  const title = [v.brandName, v.model, v.year].filter(Boolean).join(" ");

  const lines: string[] = [];
  if (title) lines.push(`🚗 ${title}`);
  lines.push("");

  const spec = (label: string, value: string) => {
    if (value) lines.push(`• ${label}: ${value}`);
  };

  spec("Kilometraje", formatKm(v.mileage));
  spec("Transmisión", labelFor(TRANSMISSION_OPTIONS, v.transmission));
  spec("Combustible", labelFor(FUEL_TYPE_OPTIONS, v.fuelType));
  spec("Carrocería", labelFor(BODY_TYPE_OPTIONS, v.bodyType));
  spec("Color exterior", v.exteriorColor || "");
  spec("Color interior", v.interiorColor || "");
  spec("Estado", labelFor(CONDITION_OPTIONS, v.condition));

  const location = [v.city, v.state].filter(Boolean).join(", ");
  spec("Ubicación", location);

  const features = (v.features || []).filter(Boolean);
  if (features.length > 0) {
    lines.push("");
    lines.push("✨ Equipamiento:");
    for (const f of features) lines.push(`  - ${f}`);
  }

  const price = formatPrice(v.price);
  if (price) {
    lines.push("");
    lines.push(`💲 Precio: ${price}`);
  }

  lines.push("");
  lines.push("📩 Escríbenos para más información o para agendar una prueba de manejo.");

  return lines.join("\n").trim();
}

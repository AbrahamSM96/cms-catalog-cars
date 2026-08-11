import {
  Gauge,
  Fuel,
  Users,
  Palette,
  Settings2,
  Armchair,
  ReceiptText,
  type LucideIcon,
} from "lucide-react";
import type { Car } from "../../types/car";

interface CarFeaturesProps {
  car: Car;
}

const FUEL_LABELS: Record<NonNullable<Car["fuelType"]>, string> = {
  gasoline: "Gasolina",
  diesel: "Diésel",
  electric: "Eléctrico",
  hybrid: "Híbrido",
  "plug-in-hybrid": "Híbrido Enchufable",
};

/** Get the color name from a relationship value (populated object or id). */
function colorName(color: Car["exteriorColor"]): string {
  if (color && typeof color === "object" && "name" in color) return color.name;
  return "";
}

interface FeatureRow {
  icon: LucideIcon;
  label: string;
  value: string;
}

export function CarFeatures({ car }: CarFeaturesProps) {
  const rows: FeatureRow[] = [];

  if (car.mileage) {
    rows.push({
      icon: Gauge,
      label: "Kilometraje",
      value: `${new Intl.NumberFormat("en-US").format(car.mileage)} Km`,
    });
  }
  if (car.fuelType) {
    rows.push({ icon: Fuel, label: "Combustible", value: FUEL_LABELS[car.fuelType] });
  }
  if (car.passengers) {
    rows.push({ icon: Users, label: "Pasajeros", value: `${car.passengers} asientos` });
  }
  const exterior = colorName(car.exteriorColor);
  if (exterior) {
    rows.push({ icon: Palette, label: "Color exterior", value: exterior });
  }
  if (car.transmission) {
    rows.push({
      icon: Settings2,
      label: "Transmisión",
      value: car.transmission === "automatic" ? "Automática" : "Manual",
    });
  }
  const interior = colorName(car.interiorColor);
  if (interior) {
    rows.push({ icon: Armchair, label: "Color interior", value: interior });
  }
  rows.push({ icon: ReceiptText, label: "IVA", value: car.hasVAT ? "Sí" : "No" });

  if (rows.length === 0) return null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <h2 className="mb-8 text-2xl font-bold text-slate-900">Características</h2>

      <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 ring-1 ring-red-100">
              <Icon className="h-5 w-5 text-red-600" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <div className="text-sm text-slate-500">{label}</div>
              <div className="truncate text-lg font-semibold text-slate-900">{value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

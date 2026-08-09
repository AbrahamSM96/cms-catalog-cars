import type { Car, Brand } from "../../types/car";
import { ShareButton } from "./ShareButton";

interface CarHeaderProps {
  car: Car;
}

export function CarHeader({ car }: CarHeaderProps) {
  if (!car) return null
  const brandName = typeof car.brand === "object" ? (car.brand as Brand).name : "Unknown";
  const exteriorColorName =
    car.exteriorColor && typeof car.exteriorColor === "object" ? car.exteriorColor.name : "";

  // Build technical specs string (like "4 Pts. 320i, L4,2.0t. 184Hp, Ta8...")
  const buildTechSpecs = () => {
    const specs: string[] = [];

    if (car.doors) specs.push(`${car.doors} Pts.`);
    if (car.model) specs.push(car.model);
    if (car.engine) specs.push(car.engine);
    if (car.horsepower) specs.push(`${car.horsepower}Hp`);
    if (car.transmission) {
      const transmissionCode = car.transmission === "automatic" ? "Ta" : "Tm";
      specs.push(transmissionCode);
    }
    if (car.bodyType) {
      const bodyTypeCode = car.bodyType.charAt(0).toUpperCase();
      specs.push(bodyTypeCode);
    }

    return specs.join(", ");
  };

  const techSpecs = buildTechSpecs();

  // Location string
  const location =
    car.location?.dealership && car.location?.city
      ? `${car.location.dealership} - ${car.location.city}`
      : car.location?.city || "Ubicación no disponible";

  return (
    <div className="mb-8">
      {/* Brand Logo (placeholder for now - will implement later) */}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <span className="text-lg font-bold text-zinc-700 dark:text-zinc-300">
            {brandName.charAt(0)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{brandName}</span>
          {/* Verified badge */}
          <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Title and Share Button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 md:text-5xl">
            {brandName} {car.version} {car.year}
          </h1>

          {/* Technical Specs */}
          {techSpecs && (
            <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
              {techSpecs}
            </p>
          )}

          {/* Location */}
          <div className="mt-3 flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm font-medium">{location}</span>
          </div>
        </div>

        {/* Share Button */}
        <ShareButton
          title={`${brandName} ${car.version} ${car.year}`}
          text={`Mira este ${brandName} ${car.version} ${car.year}`}
        />
      </div>

      {/* Additional Info Pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        {car.fuelType && (
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {car.fuelType === "gasoline" && "⛽ Gasolina"}
            {car.fuelType === "diesel" && "🛢️ Diésel"}
            {car.fuelType === "electric" && "⚡ Eléctrico"}
            {car.fuelType === "hybrid" && "🔋 Híbrido"}
            {car.fuelType === "plug-in-hybrid" && "🔌 Híbrido Enchufable"}
          </span>
        )}
        {car.transmission && (
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            ⚙️ {car.transmission === "automatic" ? "Automática" : "Manual"}
          </span>
        )}
        {car.mileage && (
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            🛣️ {new Intl.NumberFormat("en-US").format(car.mileage)} km
          </span>
        )}
        {exteriorColorName && (
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            🎨 {exteriorColorName}
          </span>
        )}
      </div>
    </div>
  );
}

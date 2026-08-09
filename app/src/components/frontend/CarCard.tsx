'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Car } from "../../types/car";
import { getImageUrl, buildCarImageAlt } from "../../lib/images";
import { buildCarSlug } from "../../lib/car-slug";

interface CarCardProps {
  car: Car;
}

export function CarCard({ car }: CarCardProps) {
  // Get brand name
  const brandName = typeof car.brand === "object" ? car.brand.name : "Unknown";

  // Get preview image: featured image, else first exterior/interior photo
  let imageUrl = "/placeholder-car.svg";
  const firstOf = (arr?: Car["exteriorImages"]) => {
    const first = Array.isArray(arr) ? arr[0] : undefined;
    return first && typeof first === "object" ? getImageUrl(first.filename) : undefined;
  };
  if (car.featuredImage && typeof car.featuredImage === "object") {
    imageUrl = getImageUrl(car.featuredImage.filename);
  } else {
    imageUrl = firstOf(car.exteriorImages) || firstOf(car.interiorImages) || imageUrl;
  }

  // Handle image error state
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  // Format price
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(car.price);

  // Format mileage
  const formattedMileage = car.mileage
    ? new Intl.NumberFormat("en-US").format(car.mileage) + " km"
    : "N/A";

  // Status badge config
  const statusConfig = {
    available: {
      label: "Disponible",
      colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
    },
    reserved: {
      label: "Reservado",
      colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    },
    sold: {
      label: "Vendido",
      colorClass: "bg-slate-500/10 text-slate-400 border-slate-500/20"
    },
  };

  const status = statusConfig[car.status];

  return (
    <Link href={`/catalogo/${buildCarSlug(car)}`} className="group block">
      <article className="relative overflow-hidden rounded-2xl border border-slate-200/50 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-slate-800/50 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:shadow-slate-950/50">
        {/* Shine effect on hover */}
        <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        </div>

        {/* Image Container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={imgSrc}
            alt={buildCarImageAlt(car)}
            fill
            className="object-cover transition-all duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
              setHasError(true);
              setImgSrc('/placeholder-car.svg');
            }}
            unoptimized={hasError}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20 opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

          {/* Badges Container */}
          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
            {/* Featured Badge */}
            {car.featured && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-600/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Destacado
              </span>
            )}

            {/* Status Badge */}
            <span className={`ml-auto inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold backdrop-blur-sm ${status.colorClass}`}>
              {status.label}
            </span>
          </div>

          {/* Year Badge - Bottom Left */}
          <div className="absolute bottom-4 left-4">
            <span className="inline-flex items-center rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-bold text-white backdrop-blur-md">
              {car.year}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <div className="mb-3">
            <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-red-600 dark:text-slate-50 dark:group-hover:text-red-500">
              {brandName} {car.model}
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
              {car.version}
            </p>
          </div>

          {/* Specs */}
          <div className="mb-4 flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            {/* Mileage */}
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">{formattedMileage}</span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            {/* Transmission */}
            <div className="flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span className="font-medium">
                {car.transmission === "automatic" ? "Automática" : "Manual"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />

          {/* Price & CTA */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-500">
                Precio
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                {formattedPrice}
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-red-600 transition-all duration-300 group-hover:gap-3 dark:text-red-500">
              Ver detalles
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </article>
    </Link>
  );
}

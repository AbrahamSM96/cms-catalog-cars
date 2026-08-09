import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCarBySlug } from "@/lib/payload-client";
import { getImageUrl, buildCarImageAlt } from "@/lib/images";
import { ImageGallery } from "@/components/frontend/ImageGallery";
import { CarHeader } from "@/components/frontend/CarHeader";
import { FinancingCalculator } from "@/components/frontend/FinancingCalculator";
import { CarFeatures } from "@/components/frontend/CarFeatures";
import { CarHistory } from "@/components/frontend/CarHistory";
import type { Media } from "@/types/car";

interface CarDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CarDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug).catch(() => null);

  if (!car || !car.id) {
    return {
      title: "Auto no encontrado",
    };
  }

  const brandName = typeof car.brand === "object" ? car.brand.name : "Unknown";
  const title = `${brandName} ${car.model} ${car.version} ${car.year}`;

  return {
    title,
    description: car.description || `${title} - Autos seminuevos de calidad`,
  };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const { slug } = await params;

  const car = await getCarBySlug(slug).catch(() => null);
  if (!car || !car.id) {
    notFound();
  }

  // Get brand name for title
  const brandName = typeof car.brand === "object" ? car.brand.name : "Unknown";

  // Fallback image shown only if there are no exterior/interior photos yet.
  const fallbackImages: Media[] =
    car.featuredImage && typeof car.featuredImage === "object" ? [car.featuredImage] : [];

  // JSON-LD structured data for SEO (Vehicle / Product)
  const featuredFilename =
    typeof car.featuredImage === "object" ? car.featuredImage?.filename : undefined;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${brandName} ${car.model} ${car.version} ${car.year}`,
    brand: { "@type": "Brand", name: brandName },
    model: car.model,
    vehicleModelDate: String(car.year),
    ...(car.mileage
      ? {
          mileageFromOdometer: {
            "@type": "QuantitativeValue",
            value: car.mileage,
            unitCode: "KMT",
          },
        }
      : {}),
    ...(car.fuelType ? { fuelType: car.fuelType } : {}),
    ...(car.horsepower
      ? {
          vehicleEngine: {
            "@type": "EngineSpecification",
            enginePower: { "@type": "QuantitativeValue", value: car.horsepower, unitCode: "HP" },
          },
        }
      : {}),
    ...(featuredFilename ? { image: getImageUrl(featuredFilename) } : {}),
    offers: {
      "@type": "Offer",
      price: car.price,
      priceCurrency: "MXN",
      availability:
        car.status === "available"
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link href="/catalogo" className="hover:text-blue-600 dark:hover:text-blue-400">
            Catálogo
          </Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-900 dark:text-zinc-50">
            {brandName} {car.model}
          </span>
        </nav>

        {/* Car Header */}
        <CarHeader car={car} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column - Gallery + Specs */}
          <div className="lg:col-span-8">
            <ImageGallery
              images={fallbackImages}
              exteriorImages={car.exteriorImages}
              interiorImages={car.interiorImages}
              alt={buildCarImageAlt(car)}
            />

            {/* Características */}
            <div className="mt-8">
              <CarFeatures car={car} />
            </div>

            {/* Historial del auto */}
            {car.history && (
              <div className="mt-8">
                <CarHistory history={car.history} />
              </div>
            )}

            {/* Description */}
            {car.description && (
              <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Descripción
                </h3>
                <p className="text-zinc-700 dark:text-zinc-300">{car.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Financing Calculator */}
          <div className="lg:col-span-4">
            <FinancingCalculator price={car.price} financing={car.financing} />
          </div>
        </div>
      </div>
    </div>
  );
}

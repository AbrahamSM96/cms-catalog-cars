import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getCarBySlug, getContact } from "@/lib/payload-client";
import { getImageUrl, buildCarImageAlt } from "@/lib/images";
import { ImageGallery } from "@/components/frontend/ImageGallery";
import { CarHeader } from "@/components/frontend/CarHeader";
import { FinancingCalculator } from "@/components/frontend/FinancingCalculator";
import { ContactButton } from "@/components/frontend/ContactButton";
import { CarFeatures } from "@/components/frontend/CarFeatures";
import { CarHistory } from "@/components/frontend/CarHistory";
import { CarLocation } from "@/components/frontend/CarLocation";
import type { Media, Dealership } from "@/types/car";

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

  const contact = await getContact();

  const brandName = typeof car.brand === "object" ? car.brand.name : "Unknown";

  // Fallback image shown only if there are no exterior/interior photos yet.
  const fallbackImages: Media[] =
    car.featuredImage && typeof car.featuredImage === "object" ? [car.featuredImage] : [];

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(car.price);

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

  const statusConfig = {
    available: { label: "Disponible", colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    reserved: { label: "Reservado", colorClass: "bg-amber-50 text-amber-700 border-amber-200" },
    sold: { label: "Vendido", colorClass: "bg-slate-100 text-slate-600 border-slate-200" },
  };
  const status = statusConfig[car.status];

  const dealership =
    car.dealership && typeof car.dealership === "object" ? (car.dealership as Dealership) : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="transition-colors hover:text-red-600">
            Inicio
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <Link href="/catalogo" className="transition-colors hover:text-red-600">
            Catálogo
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="font-medium text-slate-900">
            {brandName} {car.model}
          </span>
        </nav>

        {/* Car Header */}
        <CarHeader car={car} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column - Gallery + details */}
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
              <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
                <h3 className="mb-4 text-xl font-bold text-slate-900">Descripción</h3>
                <p className="leading-relaxed text-slate-700">{car.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Price + Contact + Financing */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              {/* Price card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Precio</span>
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${status.colorClass}`}>
                    {status.label}
                  </span>
                </div>
                <div className="mt-1 text-4xl font-bold tracking-tight text-slate-900">
                  {formattedPrice}
                </div>
                {car.hasVAT && (
                  <p className="mt-1 text-sm text-slate-500">Precio más IVA</p>
                )}
                <div className="mt-5">
                  <ContactButton car={car} whatsapp={contact?.whatsapp} />
                </div>
              </div>

              {/* Financing (optional — hidden for cash-only cars) */}
              {car.showFinancing !== false && (
                <FinancingCalculator price={car.price} financing={car.financing} />
              )}
            </div>
          </div>
        </div>

        {dealership && <CarLocation dealership={dealership} />}
      </div>
    </div>
  );
}

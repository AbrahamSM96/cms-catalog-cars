import { getCars, getFeaturedCars, getBrands, getHomepage } from "@/lib/payload-client";
import { getImageUrl } from "@/lib/images";
import { Hero, type HeroSlideView } from "@/components/frontend/Hero";
import { FeaturedCars } from "@/components/frontend/FeaturedCars";
import { SearchBar } from "@/components/frontend/SearchBar";
import { FilterBar } from "@/components/frontend/FilterBar";
import { CarGrid } from "@/components/frontend/CarGrid";
import { ScrollToResults } from "@/components/frontend/ScrollToResults";
import type { CarFilters, Media } from "@/types/car";

interface HomePageProps {
  searchParams: Promise<{
    brand?: string;
    status?: string;
    transmission?: string;
    minYear?: string;
    maxYear?: string;
    search?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  // Build filters from search params
  const filters: CarFilters = {
    brand: params.brand,
    status: params.status,
    transmission: params.transmission,
    minYear: params.minYear ? parseInt(params.minYear) : undefined,
    maxYear: params.maxYear ? parseInt(params.maxYear) : undefined,
    search: params.search,
  };

  // Fetch data in parallel
  const [carsData, featuredCars, brands, homepage] = await Promise.all([
    getCars(filters),
    getFeaturedCars(),
    getBrands(),
    getHomepage(),
  ]);

  // Resolve hero carousel slides (image relation -> Cloudinary URL).
  const heroSlides: HeroSlideView[] = (homepage?.heroSlides ?? [])
    .map((slide): HeroSlideView | null => {
      const image = slide.image;
      if (!image || typeof image !== "object") return null;
      const media = image as Media;
      return {
        url: media.url || getImageUrl(media.filename),
        // SEO alt: manual override first, then the slide caption, then a
        // descriptive, keyword-rich default so the image is never left without
        // meaningful alt text.
        alt: media.alt || slide.caption || "Catálogo de autos seminuevos en venta",
        caption: slide.caption,
      };
    })
    .filter((s): s is HeroSlideView => s !== null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white dark:from-black dark:via-slate-950 dark:to-black">
      {/* Auto-scroll to results when search/filter is active */}
      <ScrollToResults />

      {/* Hero Section */}
      <Hero slides={heroSlides} text={homepage?.hero} />

      {/* Featured Cars Section - Only show if no filters applied */}
      {!params.brand && !params.search && !params.transmission && !params.minYear && (
        <FeaturedCars cars={featuredCars} />
      )}

      {/* Main Content */}
      <section id="cars" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-12 flex justify-center">
            <SearchBar />
          </div>

          {/* Filter Bar */}
          <div className="mb-12">
            <FilterBar brands={brands} />
          </div>

          {/* Results Count */}
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
              {params.search ? `Resultados para "${params.search}"` : "Todos los Autos"}
            </h2>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {carsData.totalDocs} {carsData.totalDocs === 1 ? "auto" : "autos"} encontrados
            </span>
          </div>

          {/* Cars Grid */}
          <CarGrid cars={carsData.docs} />

          {/* Pagination - To be implemented */}
          {carsData.totalPages > 1 && (
            <div className="mt-16 text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
                Página {carsData.page} de {carsData.totalPages}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="relative overflow-hidden border-t border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 dark:border-slate-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white sm:text-4xl">
            ¿Listo para tu próximo auto?
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Contáctanos para más información o agenda una visita. Nuestro equipo está listo para ayudarte.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a
              href="https://wa.me/525512345678"
              target="_blank"
              rel="noopener noreferrer"
              className="group cursor-pointer inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:bg-green-700 hover:shadow-green-600/50"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </a>
            <a
              href="tel:+525512345678"
              className="cursor-pointer inline-flex items-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Llamar
            </a>
          </div>

          {/* Divider */}
          <div className="mx-auto mt-16 h-px w-full max-w-4xl bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

          {/* Copyright */}
          <p className="mt-8 text-sm text-slate-400">
            © 2026 CMS Catalog Cars. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

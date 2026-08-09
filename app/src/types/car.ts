/**
 * Type definitions for Car data from Payload CMS
 */

export interface Brand {
  id: string | number;
  name: string;
  slug: string;
}

export interface Color {
  id: string | number;
  name: string;
  hex?: string;
}

export interface Media {
  id: string | number;
  filename: string;
  alt: string;
  mimeType: string;
  filesize: number;
  width?: number;
  height?: number;
  url?: string;
}

export interface HeroSlide {
  id?: string;
  image: Media | string | number;
  caption?: string;
}

export interface Homepage {
  heroSlides?: HeroSlide[];
  hero?: {
    badge?: string;
    heading?: string;
    headingHighlight?: string;
    subheading?: string;
  };
}

export interface Location {
  dealership?: string;
  city?: string;
  state?: string;
}

export interface LoanTerm {
  months: number;
  id?: string;
}

export interface Financing {
  minDownPaymentPercentage?: number;
  maxDownPaymentPercentage?: number;
  defaultDownPaymentPercentage?: number;
  availableLoanTerms?: LoanTerm[];
  defaultLoanTerm?: number;
  interestRate?: number;
}

export interface FeatureItem {
  feature: string;
  id?: string;
}

export interface CarHistory {
  inspectionPoints?: number;
  ownerHistory?: "single" | "two" | "multiple";
  duplicateKeys?: boolean;
  plates?: boolean;
  manuals?: boolean;
  conditioning?: boolean;
}

export interface Car {
  id: string | number;
  brand: Brand | string | number;
  model: string;
  version: string;
  year: number;
  transmission: "automatic" | "manual";
  price: number;
  cylinders?: number;
  passengers?: number;
  mileage?: number;
  featuredImage?: Media | string | number;
  exteriorImages?: Media[] | string[] | number[];
  interiorImages?: Media[] | string[] | number[];
  description?: string;
  featured?: boolean;
  status: "available" | "reserved" | "sold";
  hasVAT?: boolean;

  // Especificaciones técnicas
  doors?: number;
  engine?: string;
  horsepower?: number;
  vehicleType?: "car" | "truck";
  bodyType?:
    | "coupe"
    | "truck"
    | "sedan"
    | "hatchback"
    | "suv"
    | "convertible"
    | "wagon"
    | "minivan"
    | "small-car";
  condition?: "excellent" | "very-good" | "good" | "fair" | "poor";
  fuelType?: "gasoline" | "diesel" | "electric" | "hybrid" | "plug-in-hybrid";

  // Ubicación
  location?: Location;

  // Financiamiento
  financing?: Financing;

  // Colores (relación con la colección "colors")
  exteriorColor?: Color | string | number;
  interiorColor?: Color | string | number;

  // Características
  features?: FeatureItem[];

  // Historial del auto
  history?: CarHistory;

  createdAt: string;
  updatedAt: string;
}

export interface CarsResponse {
  docs: Car[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  pagingCounter: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  prevPage: number | null;
  nextPage: number | null;
}

export interface CarFilters {
  brand?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  transmission?: string;
  search?: string;
}

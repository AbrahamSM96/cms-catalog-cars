"use client";

import { useState } from "react";
import Image from "next/image";
import { Images, Car, Armchair, Maximize2, ChevronLeft, ChevronRight, X, type LucideIcon } from "lucide-react";
import type { Media } from "../../types/car";
import { getImageUrl } from "../../lib/images";

interface ImageGalleryProps {
  images?: Media[];
  exteriorImages?: Media[] | string[] | number[];
  interiorImages?: Media[] | string[] | number[];
  alt: string;
}

type CategoryFilter = "all" | "exterior" | "interior";

export function ImageGallery({ images, exteriorImages, interiorImages, alt }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [isExpanded, setIsExpanded] = useState(false);

  const processedImages: Array<{ media: Media; category?: string }> = [];

  const pushCategorized = (
    items: Media[] | string[] | number[] | undefined,
    category: "exterior" | "interior",
  ) => {
    if (!items) return;
    items.forEach((item) => {
      if (typeof item === "object") {
        processedImages.push({ media: item, category });
      }
    });
  };

  pushCategorized(exteriorImages, "exterior");
  pushCategorized(interiorImages, "interior");

  if (processedImages.length === 0 && images && images.length > 0) {
    images.forEach((img) => {
      if (typeof img === "object") {
        processedImages.push({ media: img });
      }
    });
  }

  const filteredImages =
    categoryFilter === "all"
      ? processedImages
      : processedImages.filter((img) => img.category === categoryFilter);

  if (processedImages.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <Image src="/placeholder-car.svg" alt={alt} fill className="object-cover" priority unoptimized />
      </div>
    );
  }

  const selectedImage = filteredImages[selectedIndex] || filteredImages[0];
  const imageUrl = getImageUrl(selectedImage?.media.filename);
  const hasCategories = processedImages.some((img) => img.category);

  const CategoryButton = ({
    value,
    icon: Icon,
    label,
  }: {
    value: CategoryFilter;
    icon: LucideIcon;
    label: string;
  }) => (
    <button
      onClick={() => {
        setCategoryFilter(value);
        setSelectedIndex(0);
      }}
      className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
        categoryFilter === value
          ? "bg-slate-900 text-white"
          : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      {/* Category Filters */}
      {hasCategories && (
        <div className="flex flex-wrap gap-2">
          <CategoryButton value="all" icon={Images} label="Todas las fotos" />
          {processedImages.some((img) => img.category === "exterior") && (
            <CategoryButton value="exterior" icon={Car} label="Exterior" />
          )}
          {processedImages.some((img) => img.category === "interior") && (
            <CategoryButton value="interior" icon={Armchair} label="Interior" />
          )}
        </div>
      )}

      {/* Main Gallery Layout */}
      <div className="flex gap-4">
        {/* Thumbnails */}
        {filteredImages.length > 1 && (
          <div className="hidden w-24 flex-col gap-2 sm:flex">
            {filteredImages.slice(0, 5).map((imgItem, index) => {
              const thumbUrl = getImageUrl(imgItem.media.filename);
              return (
                <button
                  key={imgItem.media.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative h-20 w-full cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                    index === selectedIndex
                      ? "border-red-600 ring-2 ring-red-600/30"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Image
                    src={thumbUrl}
                    alt={`${alt} - imagen ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="100px"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-car.svg";
                    }}
                    unoptimized
                  />
                </button>
              );
            })}
            {filteredImages.length > 5 && (
              <div className="flex h-20 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-xs font-medium text-slate-500">
                +{filteredImages.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Main Image */}
        <div className="relative flex-1">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-soft">
            <Image
              key={selectedIndex}
              src={imageUrl}
              alt={alt}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 70vw"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-car.svg";
              }}
              unoptimized
            />

            {/* Expand */}
            <button
              onClick={() => setIsExpanded(true)}
              className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/90 p-2.5 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white"
              aria-label="Expandir imagen"
            >
              <Maximize2 className="h-5 w-5" aria-hidden="true" />
            </button>

            {/* Arrows */}
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1))
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2.5 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                </button>
                <button
                  onClick={() =>
                    setSelectedIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2.5 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white"
                  aria-label="Siguiente imagen"
                >
                  <ChevronRight className="h-6 w-6" aria-hidden="true" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {selectedIndex + 1} / {filteredImages.length}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <button
            className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
            onClick={() => setIsExpanded(false)}
            aria-label="Cerrar"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="relative h-[90vh] w-full max-w-7xl">
            <Image src={imageUrl} alt={alt} fill className="object-contain" sizes="100vw" unoptimized />
          </div>
        </div>
      )}
    </div>
  );
}

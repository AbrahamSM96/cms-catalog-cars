"use client";

import { useState } from "react";
import Image from "next/image";
import type { Media } from "../../types/car";
import { getImageUrl } from "../../lib/payload-client";

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

  // Process images from the dedicated exterior/interior fields, falling back
  // to a single featured image when no gallery photos exist yet.
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

  // Fallback to the featured image only when nothing else is available
  if (processedImages.length === 0 && images && images.length > 0) {
    images.forEach((img) => {
      if (typeof img === "object") {
        processedImages.push({ media: img });
      }
    });
  }

  // Filter images by category
  const filteredImages =
    categoryFilter === "all"
      ? processedImages
      : processedImages.filter((img) => img.category === categoryFilter);

  // Placeholder if no images
  if (processedImages.length === 0) {
    return (
      <div className="relative h-[600px] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <Image
          src="/placeholder-car.svg"
          alt={alt}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      </div>
    );
  }

  const selectedImage = filteredImages[selectedIndex] || filteredImages[0];
  const imageUrl = getImageUrl(selectedImage?.media.filename);

  // Check if we have categorized images
  const hasCategories = processedImages.some((img) => img.category);

  return (
    <div className="space-y-4">
      {/* Category Filters */}
      {hasCategories && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              setCategoryFilter("all");
              setSelectedIndex(0);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              categoryFilter === "all"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            📸 Ver todas las fotos
          </button>
          {processedImages.some((img) => img.category === "exterior") && (
            <button
              onClick={() => {
                setCategoryFilter("exterior");
                setSelectedIndex(0);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                categoryFilter === "exterior"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              🚗 Exterior
            </button>
          )}
          {processedImages.some((img) => img.category === "interior") && (
            <button
              onClick={() => {
                setCategoryFilter("interior");
                setSelectedIndex(0);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                categoryFilter === "interior"
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              🪑 Interior
            </button>
          )}
        </div>
      )}

      {/* Main Gallery Layout */}
      <div className="flex gap-4">
        {/* Thumbnails - Left Side */}
        {filteredImages.length > 1 && (
          <div className="flex w-24 flex-col gap-2">
            {filteredImages.slice(0, 5).map((imgItem, index) => {
              const thumbUrl = getImageUrl(imgItem.media.filename);
              return (
                <button
                  key={imgItem.media.id}
                  onClick={() => setSelectedIndex(index)}
                  className={`relative h-20 w-full overflow-hidden rounded-lg border-2 transition ${
                    index === selectedIndex
                      ? "border-blue-600 ring-2 ring-blue-600 ring-offset-2 dark:border-blue-500"
                      : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"
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
              <div className="flex h-20 w-full items-center justify-center rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 text-xs text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400">
                +{filteredImages.length - 5}
              </div>
            )}
          </div>
        )}

        {/* Main Image */}
        <div className="relative flex-1">
          <div className="relative h-[600px] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
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

            {/* Expand Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="absolute right-4 top-4 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900"
              aria-label="Expandir imagen"
            >
              <svg
                className="h-5 w-5 text-zinc-900 dark:text-zinc-100"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                />
              </svg>
            </button>

            {/* Navigation Arrows */}
            {filteredImages.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredImages.length - 1))
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900"
                  aria-label="Imagen anterior"
                >
                  <svg
                    className="h-6 w-6 text-zinc-900 dark:text-zinc-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setSelectedIndex((prev) => (prev < filteredImages.length - 1 ? prev + 1 : 0))
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-3 shadow-lg backdrop-blur-sm transition hover:bg-white dark:bg-zinc-900/90 dark:hover:bg-zinc-900"
                  aria-label="Siguiente imagen"
                >
                  <svg
                    className="h-6 w-6 text-zinc-900 dark:text-zinc-100"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900/80 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm dark:bg-white/80 dark:text-zinc-900">
              {selectedIndex + 1} / {filteredImages.length}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setIsExpanded(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 backdrop-blur-sm transition hover:bg-white/20"
            onClick={() => setIsExpanded(false)}
            aria-label="Cerrar"
          >
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="relative h-[90vh] w-full max-w-7xl">
            <Image
              src={imageUrl}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}

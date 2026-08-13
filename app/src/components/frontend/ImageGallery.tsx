'use client'

import {
  Armchair,
  Car,
  ChevronLeft,
  ChevronRight,
  Images,
  Maximize2,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { getImageUrl } from '../../lib/images'
import type { Media } from '../../types/car'

import { CategoryButton } from './CategoryButton'

interface ImageGalleryProps {
  images?: Media[]
  exteriorImages?: Media[] | string[] | number[]
  interiorImages?: Media[] | string[] | number[]
  alt: string
}

type CategoryFilter = 'all' | 'exterior' | 'interior'

/**
 * ImageGallery
 *
 * @param props -   ImageGalleryProps
 * @param props.alt - string
 * @param props.exteriorImages - Media[] | string[] | number[] | undefined
 * @param props.images - Media[] | undefined
 * @param props.interiorImages - Media[] | string[] | number[] | undefined
 */
export function ImageGallery({
  alt,
  exteriorImages,
  images,
  interiorImages,
}: ImageGalleryProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [isExpanded, setIsExpanded] = useState(false)

  const processedImages: Array<{ media: Media; category?: string }> = []

  /**
   * pushCategorized
   *
   * @param items -   Media[] | string[] | number[] | undefined
   * @param category - 'exterior' | 'interior'
   */
  const pushCategorized = (
    items: Media[] | string[] | number[] | undefined,
    category: 'exterior' | 'interior'
  ): void => {
    if (!items) return
    items.forEach((item) => {
      if (typeof item === 'object') {
        processedImages.push({ category, media: item })
      }
    })
  }

  pushCategorized(exteriorImages, 'exterior')
  pushCategorized(interiorImages, 'interior')

  if (processedImages.length === 0 && images && images.length > 0) {
    images.forEach((img) => {
      if (typeof img === 'object') {
        processedImages.push({ media: img })
      }
    })
  }

  const filteredImages =
    categoryFilter === 'all'
      ? processedImages
      : processedImages.filter((img) => img.category === categoryFilter)

  if (processedImages.length === 0) {
    return (
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
        <Image
          alt={alt}
          className="object-cover"
          fill
          priority
          src="/placeholder-car.svg"
          unoptimized
        />
      </div>
    )
  }

  const selectedImage = filteredImages[selectedIndex] || filteredImages[0]
  const imageUrl = getImageUrl(selectedImage?.media.filename)
  const hasCategories = processedImages.some((img) => img.category)

  /**
   * handleSelectCategory
   *
   * @param value - The category filter to activate.
   */
  const handleSelectCategory = (value: CategoryFilter): void => {
    setCategoryFilter(value)
    setSelectedIndex(0)
  }

  return (
    <div className="space-y-4">
      {/* Category Filters */}
      {hasCategories && (
        <div className="flex flex-wrap gap-2">
          <CategoryButton
            icon={Images}
            isActive={categoryFilter === 'all'}
            label="Todas las fotos"
            onSelect={handleSelectCategory}
            value="all"
          />
          {processedImages.some((img) => img.category === 'exterior') && (
            <CategoryButton
              icon={Car}
              isActive={categoryFilter === 'exterior'}
              label="Exterior"
              onSelect={handleSelectCategory}
              value="exterior"
            />
          )}
          {processedImages.some((img) => img.category === 'interior') && (
            <CategoryButton
              icon={Armchair}
              isActive={categoryFilter === 'interior'}
              label="Interior"
              onSelect={handleSelectCategory}
              value="interior"
            />
          )}
        </div>
      )}

      {/* Main Gallery Layout */}
      <div className="flex gap-4">
        {/* Thumbnails */}
        {filteredImages.length > 1 && (
          <div className="hidden w-24 flex-col gap-2 sm:flex">
            {filteredImages.slice(0, 5).map((imgItem, index) => {
              const thumbUrl = getImageUrl(imgItem.media.filename)
              return (
                <button
                  aria-label={`Seleccionar imagen ${index + 1}`}
                  className={`relative h-20 w-full cursor-pointer overflow-hidden rounded-xl border-2 transition ${
                    index === selectedIndex
                      ? 'border-red-600 ring-2 ring-red-600/30'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  key={imgItem.media.id}
                  onClick={() => setSelectedIndex(index)}
                  type="button"
                >
                  <Image
                    alt={`${alt} - imagen ${index + 1}`}
                    className="object-cover"
                    fill
                    onError={(e) => {
                      const target = e.currentTarget
                      target.src = '/placeholder-car.svg'
                    }}
                    sizes="100px"
                    src={thumbUrl}
                    unoptimized
                  />
                </button>
              )
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
          <div className="shadow-soft relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
            <Image
              alt={alt}
              className="object-cover"
              fill
              key={selectedIndex}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.currentTarget
                target.src = '/placeholder-car.svg'
              }}
              priority
              sizes="(max-width: 768px) 100vw, 70vw"
              src={imageUrl}
              unoptimized
            />

            {/* Expand */}
            <button
              aria-label="Expandir imagen"
              className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/90 p-2.5 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white"
              onClick={() => setIsExpanded(true)}
              type="button"
            >
              <Maximize2 aria-hidden="true" className="h-5 w-5" />
            </button>

            {/* Arrows */}
            {filteredImages.length > 1 && (
              <>
                <button
                  aria-label="Imagen anterior"
                  className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2.5 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white"
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev > 0 ? prev - 1 : filteredImages.length - 1
                    )
                  }
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" className="h-6 w-6" />
                </button>
                <button
                  aria-label="Siguiente imagen"
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2.5 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white"
                  onClick={() =>
                    setSelectedIndex((prev) =>
                      prev < filteredImages.length - 1 ? prev + 1 : 0
                    )
                  }
                  type="button"
                >
                  <ChevronRight aria-hidden="true" className="h-6 w-6" />
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
            aria-label="Cerrar"
            className="absolute top-4 right-4 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
            onClick={() => setIsExpanded(false)}
            type="button"
          >
            <X aria-hidden="true" className="h-6 w-6" />
          </button>
          <div className="relative h-[90vh] w-full max-w-7xl">
            <Image
              alt={alt}
              className="object-contain"
              fill
              sizes="100vw"
              src={imageUrl}
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  )
}

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
import { useCallback, useEffect, useRef, useState } from 'react'

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

/** Distancia mínima horizontal (px) para que un swipe cambie de imagen. */
const SWIPE_THRESHOLD_PX = 50

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
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

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

  const totalImages = filteredImages.length

  const goPrev = useCallback((): void => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1))
  }, [totalImages])

  const goNext = useCallback((): void => {
    setSelectedIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0))
  }, [totalImages])

  useEffect(() => {
    if (!isExpanded) return

    /**
     * handleKeyDown
     *
     * @param event - Keyboard event fired while the lightbox is open.
     */
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsExpanded(false)
      if (event.key === 'ArrowLeft') goPrev()
      if (event.key === 'ArrowRight') goNext()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return (): void => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [goNext, goPrev, isExpanded])

  /**
   * handleTouchStart
   *
   * @param event - Touch event fired when the swipe begins.
   */
  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>): void => {
    const touch = event.touches[0]
    if (!touch) return
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  /**
   * handleTouchEnd
   *
   * @param event - Touch event fired when the swipe ends.
   */
  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>): void => {
    const start = touchStartRef.current
    const touch = event.changedTouches[0]
    touchStartRef.current = null

    if (!start || !touch || totalImages < 2) return

    const deltaX = touch.clientX - start.x
    const deltaY = touch.clientY - start.y

    // Ignora arrastres verticales (scroll) y toques cortos.
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return
    if (Math.abs(deltaX) <= Math.abs(deltaY)) return

    if (deltaX < 0) {
      goNext()
    } else {
      goPrev()
    }
  }

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
                  className={`relative h-20 w-full cursor-pointer overflow-hidden rounded-xl border-2 transition ${index === selectedIndex
                      ? 'border-accent-600 ring-2 ring-accent-600/30'
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
          <div
            className="shadow-soft relative aspect-[4/3] w-full touch-pan-y overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
          >
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
                  onClick={goPrev}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" className="h-6 w-6" />
                </button>
                <button
                  aria-label="Siguiente imagen"
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2.5 text-slate-800 shadow-md backdrop-blur-sm transition hover:bg-white"
                  onClick={goNext}
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
          aria-label="Galería de imágenes"
          aria-modal="true"
          className="fixed inset-0 z-[60] flex flex-col bg-black/95"
          onClick={() => setIsExpanded(false)}
          role="dialog"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between gap-4 p-4">
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
              {selectedIndex + 1} / {totalImages}
            </span>
            <button
              aria-label="Cerrar"
              className="cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
              onClick={() => setIsExpanded(false)}
              type="button"
            >
              <X aria-hidden="true" className="h-6 w-6" />
            </button>
          </div>

          {/* Main image */}
          <div
            className="relative min-h-0 flex-1 touch-pan-y px-4"
            onTouchEnd={handleTouchEnd}
            onTouchStart={handleTouchStart}
          >
            <Image
              alt={alt}
              className="object-contain"
              fill
              key={selectedIndex}
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.currentTarget
                target.src = '/placeholder-car.svg'
              }}
              sizes="100vw"
              src={imageUrl}
              unoptimized
            />

            {totalImages > 1 && (
              <>
                <button
                  aria-label="Imagen anterior"
                  className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    goPrev()
                  }}
                  type="button"
                >
                  <ChevronLeft aria-hidden="true" className="h-7 w-7" />
                </button>
                <button
                  aria-label="Siguiente imagen"
                  className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    goNext()
                  }}
                  type="button"
                >
                  <ChevronRight aria-hidden="true" className="h-7 w-7" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {totalImages > 1 && (
            <div
              className="flex gap-2 overflow-x-auto p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredImages.map((imgItem, index) => {
                const thumbUrl = getImageUrl(imgItem.media.filename)
                return (
                  <button
                    aria-label={`Seleccionar imagen ${index + 1}`}
                    className={`relative h-16 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition sm:h-20 sm:w-28 ${index === selectedIndex
                        ? 'border-accent-600 opacity-100'
                        : 'border-transparent opacity-60 hover:opacity-100'
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
                      sizes="120px"
                      src={thumbUrl}
                      unoptimized
                    />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

export interface HeroSlideView {
  url: string;
  caption?: string;
  alt: string;
}

interface HeroText {
  badge?: string;
  heading?: string;
  headingHighlight?: string;
  subheading?: string;
}

interface HeroProps {
  slides?: HeroSlideView[];
  text?: HeroText;
}

const DEFAULT_TEXT: Required<HeroText> = {
  badge: 'Nuevos modelos disponibles',
  heading: 'Encuentra Tu Auto',
  headingHighlight: 'Seminuevo Ideal',
  subheading:
    'La mejor selección de autos premium con garantía de calidad. Financiamiento disponible y facilidades de pago.',
};

const AUTOPLAY_MS = 5000;

export function Hero({ slides = [], text }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  const t = { ...DEFAULT_TEXT, ...text };
  const hasSlides = slides.length > 0;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const goTo = useCallback(
    (index: number) => setCurrent((index + slides.length) % slides.length),
    [slides.length],
  );

  // Autoplay: advance while there is more than one slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Carousel background */}
      {hasSlides ? (
        <div className="absolute inset-0">
          {slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === current ? 'opacity-100' : 'opacity-0'
              }`}
              aria-hidden={i !== current}
            >
              <Image
                src={slide.url}
                alt={slide.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ))}
          {/* Darkening overlay so the text stays readable over any photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/70 to-slate-900/40" />
        </div>
      ) : (
        <>
          {/* Fallback background pattern (no slides configured) */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
        </>
      )}

      {/* Hero Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div
            className={`mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
            <span className="text-sm font-medium text-white/90">{t.badge}</span>
          </div>

          {/* Heading */}
          <h1
            className={`text-5xl font-bold tracking-tight text-white transition-all duration-700 delay-100 sm:text-6xl lg:text-7xl ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {t.heading}
            {t.headingHighlight && (
              <span className="mt-2 block bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                {t.headingHighlight}
              </span>
            )}
          </h1>

          {/* Description */}
          <p
            className={`mx-auto mt-6 max-w-2xl text-xl text-slate-300 transition-all duration-700 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {t.subheading}
          </p>

          {/* CTA Buttons */}
          <div
            className={`mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row transition-all duration-700 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <a
              href="#cars"
              className="group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-red-600 px-8 py-4 font-semibold text-white shadow-2xl transition-all duration-300 hover:bg-red-700 hover:shadow-red-500/50"
            >
              <span className="absolute inset-0 h-full w-full bg-gradient-to-br from-red-500 to-red-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              <span className="relative flex items-center gap-2">
                Ver Inventario
                <svg
                  className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </a>

            <a
              href="#contact"
              className="group cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/20 bg-white/5 px-8 py-4 font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10"
            >
              Contactar
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </a>
          </div>

          {/* Stats */}
          <div
            className={`mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3 transition-all duration-700 delay-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            {[
              { value: '500+', label: 'Autos Disponibles' },
              { value: '98%', label: 'Clientes Satisfechos' },
              { value: '5★', label: 'Calificación' },
            ].map((stat, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-2 text-sm text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Carousel controls (only with 2+ slides) */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            aria-label="Slide anterior"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            aria-label="Slide siguiente"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-40 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ir al slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === current ? 'w-8 bg-red-500' : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-black" />
    </section>
  );
}

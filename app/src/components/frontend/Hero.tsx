"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { SearchBar } from "./SearchBar";

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
  badge: "Nuevos modelos disponibles",
  heading: "Encuentra Tu Auto",
  headingHighlight: "Seminuevo Ideal",
  subheading:
    "La mejor selección de autos premium con garantía de calidad. Financiamiento disponible y facilidades de pago.",
};

const AUTOPLAY_MS = 5000;

const TRUST = [
  {
    label: "Garantía de calidad",
    path: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    label: "Financiamiento disponible",
    path: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    label: "Inspección certificada",
    path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
];

export function Hero({ slides = [], text }: HeroProps) {
  const [current, setCurrent] = useState(0);

  const t = { ...DEFAULT_TEXT, ...text };
  const hasSlides = slides.length > 0;

  const goTo = useCallback(
    (index: number) => setCurrent((index + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setCurrent((c) => (c + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Soft ambient glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-[32rem] w-[52rem] -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />
      <div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pt-28 pb-16 sm:px-6 sm:pt-32 lg:px-8">
        {/* Copy block */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-soft">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-medium text-slate-700">{t.badge}</span>
          </div>

          <h1
            className="animate-rise mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
            style={{ animationDelay: "80ms" }}
          >
            {t.heading}
            {t.headingHighlight && (
              <span className="mt-2 block bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                {t.headingHighlight}
              </span>
            )}
          </h1>

          <p
            className="animate-rise mx-auto mt-6 max-w-2xl text-lg text-slate-600 sm:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            {t.subheading}
          </p>

          {/* Integrated search */}
          <div
            className="animate-rise mt-8 flex justify-center"
            style={{ animationDelay: "240ms" }}
          >
            <SearchBar />
          </div>

          {/* Trust chips */}
          <div
            className="animate-rise mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
            style={{ animationDelay: "320ms" }}
          >
            {TRUST.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.path} />
                </svg>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Cinematic image showcase */}
        <div
          className="animate-rise relative mx-auto mt-14 max-w-6xl"
          style={{ animationDelay: "400ms" }}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-float sm:aspect-[21/9]">
            {hasSlides ? (
              slides.map((slide, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    i === current ? "opacity-100" : "opacity-0"
                  }`}
                  aria-hidden={i !== current}
                >
                  <Image
                    src={slide.url}
                    alt={slide.alt}
                    fill
                    priority={i === 0}
                    sizes="(max-width: 1152px) 100vw, 1152px"
                    className="object-cover"
                  />
                  {slide.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-16">
                      <p className="text-lg font-semibold text-white drop-shadow sm:text-xl">
                        {slide.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-100">
                <svg className="h-24 w-24 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 17H6a2 2 0 01-2-2v-3.28a2 2 0 01.12-.68l1.7-4.53A2 2 0 017.7 5.2h8.6a2 2 0 011.88 1.31l1.7 4.53a2 2 0 01.12.68V15a2 2 0 01-2 2h-2M9 17h6M9 17a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                  />
                </svg>
              </div>
            )}

            {/* Controls */}
            {slides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo(current - 1)}
                  aria-label="Slide anterior"
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-white/40 bg-white/70 p-2.5 text-slate-800 backdrop-blur-md transition-colors hover:bg-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => goTo(current + 1)}
                  aria-label="Slide siguiente"
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full border border-white/40 bg-white/70 p-2.5 text-slate-800 backdrop-blur-md transition-colors hover:bg-white"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Ir al slide ${i + 1}`}
                      className={`h-2 cursor-pointer rounded-full transition-all ${
                        i === current ? "w-8 bg-red-500" : "w-2 bg-white/70 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

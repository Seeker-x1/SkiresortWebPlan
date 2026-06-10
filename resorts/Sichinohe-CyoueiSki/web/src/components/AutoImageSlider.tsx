"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Slide = {
  src: string;
  alt: string;
};

const DEFAULT_INTERVAL_MS = 4500;

export function AutoImageSlider({ slides }: { slides: Slide[] }) {
  const safeSlides = useMemo(() => slides.filter((slide) => slide.src && slide.alt), [slides]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (safeSlides.length <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeSlides.length);
    }, DEFAULT_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isPaused, safeSlides.length]);

  if (safeSlides.length === 0) return null;

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + safeSlides.length) % safeSlides.length);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % safeSlides.length);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-700">
      <div className="relative aspect-[16/9] w-full bg-zinc-950/10 dark:bg-zinc-900/20">
        {safeSlides.map((slide, index) => (
          <div
            key={slide.src}
            aria-hidden={currentIndex !== index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              currentIndex === index ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <Image src={slide.src} alt={slide.alt} fill sizes="100vw" className="object-cover" />
          </div>
        ))}
      </div>

      {safeSlides.length > 1 ? (
        <div className="flex items-center justify-between gap-3 border-t border-zinc-200/80 bg-white/80 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900/70">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="rounded-md border border-zinc-300 px-3 py-1 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label="前のスライド"
            >
              前へ
            </button>
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="rounded-md border border-zinc-300 px-3 py-1 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
              aria-label={isPaused ? "自動再生を再開" : "自動再生を一時停止"}
            >
              {isPaused ? "再生" : "停止"}
            </button>
          </div>
          <div className="flex items-center gap-2">
            {safeSlides.map((slide, index) => (
              <button
                key={`${slide.src}-dot`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  currentIndex === index ? "bg-zinc-900 dark:bg-zinc-100" : "bg-zinc-300 dark:bg-zinc-600"
                }`}
                aria-label={`${index + 1}枚目を表示`}
                aria-pressed={currentIndex === index}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={goNext}
            className="rounded-md border border-zinc-300 px-3 py-1 text-xs text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            aria-label="次のスライド"
          >
            次へ
          </button>
        </div>
      ) : null}
    </div>
  );
}

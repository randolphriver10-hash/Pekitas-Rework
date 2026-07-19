"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BannerRow } from "@/lib/supabase/types";

const AUTO_ADVANCE_MS = 2000;
const SWIPE_THRESHOLD_PX = 50;

export function HeroCarousel({ banners }: { banners: BannerRow[] }) {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Entrada: arranca desplazado hacia arriba y transparente, y un tick después
  // del mount se anima a su posición final — produce el efecto de "aparecer
  // desde arriba con scroll suave mientras se desdifumina".
  useEffect(() => {
    const raf = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, AUTO_ADVANCE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length]);

  const goTo = (next: number) => {
    setIndex(((next % banners.length) + banners.length) % banners.length);
    // Reiniciar el auto-avance para que no cambie de nuevo enseguida después
    // de una interacción manual (swipe o click en un punto).
    if (timerRef.current) clearInterval(timerRef.current);
    if (banners.length > 1) {
      timerRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % banners.length);
      }, AUTO_ADVANCE_MS);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      goTo(delta < 0 ? index + 1 : index - 1);
    }
    touchStartX.current = null;
  };

  if (banners.length === 0) return null;

  return (
    <section
      className={`relative aspect-[4/5] w-full overflow-hidden bg-(--site-beige) transition-all duration-700 ease-out sm:aspect-[16/9] md:aspect-[21/9] ${
        mounted ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0"
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="relative h-full w-full shrink-0">
            {banner.image_url &&
              (banner.cta_url ? (
                <Link href={banner.cta_url} className="block h-full w-full">
                  <Image
                    src={banner.image_url}
                    alt={banner.title ?? ""}
                    fill
                    sizes="100vw"
                    priority
                    className="object-cover"
                  />
                </Link>
              ) : (
                <Image
                  src={banner.image_url}
                  alt={banner.title ?? ""}
                  fill
                  sizes="100vw"
                  priority
                  className="object-cover"
                />
              ))}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`Ir al banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

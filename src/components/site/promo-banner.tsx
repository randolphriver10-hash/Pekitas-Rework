"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

function useCountdown(endAt: string) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, new Date(endAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  if (remaining == null) return null;
  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining % 86_400_000) / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  return { days, hours, minutes, seconds, expired: remaining <= 0 };
}

export function PromoBanner({
  name,
  description,
  ctaText,
  ctaUrl,
  endAt,
  showCountdown,
}: {
  name: string;
  description: string | null;
  ctaText: string | null;
  ctaUrl: string | null;
  endAt: string;
  showCountdown: boolean;
}) {
  const countdown = useCountdown(endAt);

  if (countdown?.expired) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
      <div className="bg-(--site-blush) flex flex-col items-center justify-between gap-4 rounded-3xl px-6 py-8 text-center sm:flex-row sm:text-left">
        <div>
          <h3 className="font-[family-name:var(--font-fraunces)] text-2xl font-medium text-(--site-ink)">
            {name}
          </h3>
          {description && <p className="mt-1 text-sm text-stone-700">{description}</p>}
        </div>

        <div className="flex items-center gap-4">
          {showCountdown && countdown && (
            <div className="flex gap-2 text-center">
              {[
                { value: countdown.days, label: "d" },
                { value: countdown.hours, label: "h" },
                { value: countdown.minutes, label: "m" },
                { value: countdown.seconds, label: "s" },
              ].map((unit) => (
                <div key={unit.label} className="rounded-lg bg-white/70 px-2.5 py-1.5">
                  <div className="text-sm font-semibold text-(--site-ink)">
                    {String(unit.value).padStart(2, "0")}
                  </div>
                  <div className="text-[10px] text-stone-500">{unit.label}</div>
                </div>
              ))}
            </div>
          )}
          {ctaText && ctaUrl && (
            <Link
              href={ctaUrl}
              className="inline-flex h-10 items-center rounded-full bg-(--site-ink) px-5 text-sm font-medium text-white"
            >
              {ctaText}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

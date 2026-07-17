import { Star } from "lucide-react";
import type { TestimonialRow } from "@/lib/supabase/types";

export function TestimonialsSection({ testimonials }: { testimonials: TestimonialRow[] }) {
  if (testimonials.length === 0) return null;

  return (
    <section className="bg-(--site-beige)/40 py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-medium tracking-[0.2em] text-(--site-blush-deep) uppercase">
          Testimonios
        </p>
        <h2 className="font-[family-name:var(--font-fraunces)] mt-2 text-3xl font-medium text-(--site-ink)">
          Lo que dicen nuestras clientas
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.id} className="rounded-2xl bg-white p-6 shadow-sm">
              {t.rating && (
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < t.rating! ? "fill-amber-400 text-amber-400" : "text-stone-200"
                      }`}
                    />
                  ))}
                </div>
              )}
              <p className="text-sm leading-relaxed text-stone-600">&ldquo;{t.content}&rdquo;</p>
              <p className="mt-4 text-sm font-medium text-(--site-ink)">{t.customer_name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

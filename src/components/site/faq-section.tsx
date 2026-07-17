import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqRow } from "@/lib/supabase/types";

export function FaqSection({ faqs }: { faqs: FaqRow[] }) {
  if (faqs.length === 0) return null;

  return (
    <section id="faqs" className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
      <p className="text-xs font-medium tracking-[0.2em] text-(--site-blush-deep) uppercase">
        Ayuda
      </p>
      <h2 className="font-[family-name:var(--font-fraunces)] mt-2 text-3xl font-medium text-(--site-ink)">
        Preguntas frecuentes
      </h2>

      <Accordion className="mt-8">
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-left font-medium text-(--site-ink)">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-stone-600">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

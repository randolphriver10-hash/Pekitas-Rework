import { NewsletterSignup } from "@/components/site/newsletter-signup";

export function NewsletterSection() {
  return (
    <section className="bg-(--site-ink) py-14">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 text-center sm:px-6">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-medium text-white sm:text-3xl">
          Enterate primero de las nuevas colecciones
        </h2>
        <p className="max-w-md text-sm text-stone-300">
          Sumate a la lista y te avisamos por email cuando entra stock nuevo y hay ofertas para
          revendedoras.
        </p>
        <NewsletterSignup />
      </div>
    </section>
  );
}

import Image from "next/image";

type HeroContent = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  image_url?: string;
  cta_label?: string;
  cta_href?: string;
};

export function Hero({ content }: { content: HeroContent }) {
  return (
    <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-24">
      <div className="max-w-xl">
        {content.eyebrow && (
          <p className="mb-4 text-xs font-medium tracking-[0.2em] text-(--site-blush-deep) uppercase">
            {content.eyebrow}
          </p>
        )}
        <h1 className="font-[family-name:var(--font-fraunces)] text-4xl leading-[1.1] font-medium text-(--site-ink) sm:text-5xl">
          {content.title}
        </h1>
        {content.subtitle && (
          <p className="mt-6 text-base leading-relaxed text-stone-600">{content.subtitle}</p>
        )}
        {content.cta_label && content.cta_href && (
          <a
            href={content.cta_href}
            className="mt-8 inline-flex h-11 items-center rounded-full bg-(--site-ink) px-7 text-sm font-medium text-(--site-cream) shadow-sm transition-transform hover:-translate-y-0.5"
          >
            {content.cta_label}
          </a>
        )}
      </div>

      {content.image_url && (
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-(--site-beige) shadow-sm md:aspect-[3/4]">
          <Image
            src={content.image_url}
            alt=""
            fill
            priority
            sizes="(min-width: 768px) 40vw, 90vw"
            className="object-cover"
          />
        </div>
      )}
    </section>
  );
}

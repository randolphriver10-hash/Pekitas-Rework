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
    <section className="relative aspect-[4/5] w-full overflow-hidden bg-(--site-beige) sm:aspect-[16/9] md:aspect-[21/9]">
      {content.image_url && (
        <Image
          src={content.image_url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 px-4 pb-10 sm:px-8 sm:pb-14 md:px-12">
        <div className="max-w-lg">
          {content.eyebrow && (
            <p className="mb-3 text-xs font-medium tracking-[0.2em] text-white/80 uppercase">
              {content.eyebrow}
            </p>
          )}
          {content.title && (
            <h1 className="font-[family-name:var(--font-fraunces)] text-5xl leading-[0.95] font-semibold text-white sm:text-6xl md:text-7xl">
              {content.title}
            </h1>
          )}
          {content.subtitle && (
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/90 sm:text-base">
              {content.subtitle}
            </p>
          )}
          {content.cta_label && content.cta_href && (
            <a
              href={content.cta_href}
              className="mt-6 inline-flex h-11 items-center rounded-full bg-white px-7 text-sm font-medium text-(--site-ink) shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {content.cta_label}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

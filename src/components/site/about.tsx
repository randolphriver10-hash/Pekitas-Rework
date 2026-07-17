import Image from "next/image";

type AboutContent = {
  title?: string;
  text1?: string;
  text2?: string;
  image_url?: string;
};

export function About({ content }: { content: AboutContent }) {
  return (
    <section id="nosotros" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        {content.image_url && (
          <div className="relative order-2 aspect-[4/3] w-full overflow-hidden rounded-3xl bg-(--site-beige) md:order-1">
            <Image
              src={content.image_url}
              alt=""
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="order-1 md:order-2">
          <h2 className="font-[family-name:var(--font-fraunces)] text-3xl font-medium text-(--site-ink) sm:text-4xl">
            {content.title}
          </h2>
          {content.text1 && (
            <p className="mt-5 text-base leading-relaxed text-stone-600">{content.text1}</p>
          )}
          {content.text2 && (
            <p className="mt-4 text-base leading-relaxed text-stone-600">{content.text2}</p>
          )}
        </div>
      </div>
    </section>
  );
}

type BenefitsContent = { items?: { icon?: string; title?: string }[] };

export function Benefits({ content }: { content: BenefitsContent }) {
  const items = content.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="border-y border-stone-200/70 bg-(--site-beige)/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-5 md:gap-4">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col items-center gap-2 text-center">
            <span className="text-2xl">{item.icon}</span>
            <p className="text-xs leading-snug font-medium text-stone-700">{item.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

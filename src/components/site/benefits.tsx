type BenefitsContent = { items?: { icon?: string; title?: string }[] };

export function Benefits({ content }: { content: BenefitsContent }) {
  const items = content.items ?? [];
  if (items.length === 0) return null;

  return (
    <section className="bg-(--site-ink)">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 py-6 sm:px-6">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 text-center">
            <span className="text-lg">{item.icon}</span>
            <p className="text-xs font-medium tracking-wide text-white uppercase sm:text-sm">
              {item.title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

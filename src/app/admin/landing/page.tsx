import { createClient } from "@/lib/supabase/server";
import { SectionCard } from "@/app/admin/landing/section-card";
import { BannersSection } from "@/app/admin/landing/banners-section";

export default async function LandingContentPage() {
  const supabase = await createClient();
  const [{ data: sections }, { data: banners }] = await Promise.all([
    supabase.from("landing_sections").select("*").order("sort_order", { ascending: true }),
    supabase.from("banners").select("*").is("deleted_at", null).order("sort_order", { ascending: true }),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Contenido de la landing</h1>
        <p className="text-muted-foreground text-sm">
          Solo las secciones publicadas y visibles aparecen en el sitio.
        </p>
      </div>

      <div className="space-y-4">
        {(sections ?? []).map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      <BannersSection banners={banners ?? []} />
    </div>
  );
}

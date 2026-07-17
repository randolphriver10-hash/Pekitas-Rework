import { createClient } from "@/lib/supabase/server";
import { SeoForm } from "@/app/admin/configuracion/seo-form";

export default async function ConfigPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", true).single();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuración y SEO</h1>
        <p className="text-muted-foreground text-sm">Metadatos globales del sitio.</p>
      </div>
      <SeoForm settings={settings!} />
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { BusinessInfoForm } from "@/app/admin/negocio/business-info-form";

export default async function BusinessInfoPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", true).single();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Información del negocio</h1>
        <p className="text-muted-foreground text-sm">
          Se actualiza automáticamente en la landing pública.
        </p>
      </div>
      <BusinessInfoForm settings={settings!} />
    </div>
  );
}

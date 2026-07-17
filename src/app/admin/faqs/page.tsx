import { createClient } from "@/lib/supabase/server";
import { FaqsList } from "@/app/admin/faqs/faqs-list";

export default async function FaqsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("faqs")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Preguntas frecuentes</h1>
        <p className="text-muted-foreground text-sm">Se muestran en formato acordeón en la landing.</p>
      </div>
      <FaqsList faqs={data ?? []} />
    </div>
  );
}

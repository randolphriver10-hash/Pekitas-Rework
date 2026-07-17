import { createClient } from "@/lib/supabase/server";
import { GalleryGrid } from "@/app/admin/galeria/gallery-grid";

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("gallery_items")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Imágenes y archivos</h1>
        <p className="text-muted-foreground text-sm">Galería / lookbook que se muestra en la landing.</p>
      </div>
      <GalleryGrid items={data ?? []} />
    </div>
  );
}

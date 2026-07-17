import { createClient } from "@/lib/supabase/server";
import { TestimonialsList } from "@/app/admin/testimonios/testimonials-list";

export default async function TestimonialsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .is("deleted_at", null)
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Testimonios</h1>
        <p className="text-muted-foreground text-sm">Reseñas de clientes que se muestran en la landing.</p>
      </div>
      <TestimonialsList testimonials={data ?? []} />
    </div>
  );
}

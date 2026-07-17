import { createClient } from "@/lib/supabase/server";
import { SocialLinksList } from "@/app/admin/redes/social-links-list";

export default async function SocialLinksPage() {
  const supabase = await createClient();
  const { data: links } = await supabase
    .from("social_links")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Redes sociales</h1>
        <p className="text-muted-foreground text-sm">Se muestran en el footer de la landing.</p>
      </div>
      <SocialLinksList links={links ?? []} />
    </div>
  );
}

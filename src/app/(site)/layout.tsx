import { Fraunces, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { WhatsAppFloatingButton } from "@/components/site/whatsapp-button";
import { TopBanner } from "@/components/site/top-banner";
import { RealtimeWatcher } from "@/components/site/realtime-watcher";
import { getSiteSettings, getPublishedSections, getSection } from "@/lib/site-data";
import { getActiveCategories } from "@/lib/catalog-data";
import { getActiveBanner } from "@/lib/banners-data";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { createClient } from "@/lib/supabase/server";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const [settings, sections, { data: socialLinks }, topBanner, categories] = await Promise.all([
    getSiteSettings(),
    getPublishedSections(),
    supabase.from("social_links").select("*").eq("is_active", true).order("sort_order"),
    getActiveBanner("top"),
    getActiveCategories(),
  ]);

  const header = getSection(sections, "header");
  const footer = getSection(sections, "footer");
  const whatsappUrl = buildWhatsAppUrl(
    settings?.whatsapp_number,
    settings?.whatsapp_message_template ?? undefined
  );

  return (
    <div
      className={`${fraunces.variable} ${manrope.variable} site-theme bg-(--site-cream) text-(--site-ink) flex min-h-svh flex-col font-[family-name:var(--font-manrope)]`}
    >
      {topBanner && <TopBanner banner={topBanner} />}
      <SiteHeader
        logoUrl={(header?.content as { logo_url?: string })?.logo_url}
        businessName={settings?.business_name ?? "Pekitas"}
        whatsappNumber={settings?.whatsapp_number ?? null}
        categories={categories}
      />
      <main className="flex-1">{children}</main>
      <SiteFooter
        settings={settings}
        content={(footer?.content as { tagline?: string; copyright?: string }) ?? {}}
        socialLinks={socialLinks ?? []}
        whatsappUrl={whatsappUrl}
      />
      <WhatsAppFloatingButton whatsappUrl={whatsappUrl} />
      <RealtimeWatcher />
    </div>
  );
}

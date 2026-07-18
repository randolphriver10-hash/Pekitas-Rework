import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Hero } from "@/components/site/hero";
import { Benefits } from "@/components/site/benefits";
import { About } from "@/components/site/about";
import { FeaturedProducts } from "@/components/site/featured-products";
import { CategoryShowcase } from "@/components/site/category-showcase";
import { PromoBanner } from "@/components/site/promo-banner";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { FaqSection } from "@/components/site/faq-section";
import { GallerySection } from "@/components/site/gallery-section";
import { NewsletterSection } from "@/components/site/newsletter-section";
import { getSiteSettings, getPublishedSections, getSection } from "@/lib/site-data";
import { getFeaturedProducts, getActiveCategories } from "@/lib/catalog-data";
import { getActiveBannerPromotion } from "@/lib/promotions";
import { createClient } from "@/lib/supabase/server";

type HeroContent = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  image_url?: string;
  cta_label?: string;
  cta_href?: string;
};

type AboutContent = { title?: string; text1?: string; text2?: string; image_url?: string };

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings?.seo_title ?? settings?.business_name ?? "Pekitas",
    description: settings?.seo_description ?? undefined,
    alternates: settings?.seo_canonical_url ? { canonical: settings.seo_canonical_url } : undefined,
    openGraph: {
      title: settings?.seo_title ?? undefined,
      description: settings?.seo_description ?? undefined,
      images: settings?.seo_image_url ? [settings.seo_image_url] : undefined,
    },
  };
}

export default async function HomePage() {
  const supabase = await createClient();
  const [
    settings,
    sections,
    featuredProducts,
    categories,
    activePromotion,
    { data: testimonials },
    { data: faqs },
    { data: galleryItems },
  ] = await Promise.all([
    getSiteSettings(),
    getPublishedSections(),
    getFeaturedProducts(),
    getActiveCategories(),
    getActiveBannerPromotion(),
    supabase
      .from("testimonials")
      .select("*")
      .eq("status", "published")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(6),
    supabase
      .from("faqs")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true }),
    supabase
      .from("gallery_items")
      .select("*")
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("sort_order", { ascending: true })
      .limit(8),
  ]);

  const announcementBar = getSection(sections, "announcement_bar");
  const hero = getSection(sections, "hero");
  const benefits = getSection(sections, "benefits");
  const about = getSection(sections, "about");

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.business_name,
    url: siteUrl,
    logo: settings?.logo_url ?? undefined,
    description: settings?.description ?? undefined,
    address: settings?.address
      ? { "@type": "PostalAddress", streetAddress: settings.address }
      : undefined,
    telephone: settings?.whatsapp_number ?? undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {announcementBar && (
        <AnnouncementBar content={announcementBar.content as { texts?: string[] }} />
      )}
      {hero && <Hero content={hero.content as HeroContent} />}

      {activePromotion && (
        <PromoBanner
          name={activePromotion.name}
          description={activePromotion.description}
          ctaText={activePromotion.cta_text}
          ctaUrl={activePromotion.cta_url}
          endAt={activePromotion.end_at}
          showCountdown={activePromotion.show_countdown}
        />
      )}

      <CategoryShowcase categories={categories} />
      {benefits && <Benefits content={benefits.content as { items?: { icon?: string; title?: string }[] }} />}
      <FeaturedProducts products={featuredProducts} />
      <GallerySection items={galleryItems ?? []} />
      {about && <About content={about.content as AboutContent} />}
      <TestimonialsSection testimonials={testimonials ?? []} />
      <FaqSection faqs={faqs ?? []} />
      <NewsletterSection />
    </>
  );
}

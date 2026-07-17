import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/catalog-data";
import { getSiteSettings } from "@/lib/site-data";
import { ProductDetail } from "@/app/(site)/productos/[slug]/product-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.seo_title ?? product.name,
    description: product.seo_description ?? product.short_description ?? undefined,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSiteSettings()]);

  if (!product) notFound();

  const images = [...product.product_images].sort((a, b) => a.sort_order - b.sort_order);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.short_description ?? undefined,
    image: images.map((img) => img.url),
    sku: product.sku ?? undefined,
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/productos/${product.slug}`,
      priceCurrency: "ARS",
      price: product.sale_price ?? product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail
        name={product.name}
        price={product.price}
        salePrice={product.sale_price}
        images={images}
        variants={product.product_variants}
        stock={product.stock}
        whatsappNumber={settings?.whatsapp_number ?? null}
        messageTemplate={settings?.whatsapp_message_template ?? null}
        productUrl={`${siteUrl}/productos/${product.slug}`}
      />

      {product.description && (
        <div className="mt-12 max-w-2xl border-t border-stone-200 pt-8">
          <h2 className="mb-3 text-sm font-medium tracking-wide text-stone-500 uppercase">
            Descripción
          </h2>
          <p className="whitespace-pre-line text-stone-600">{product.description}</p>
        </div>
      )}
    </div>
  );
}

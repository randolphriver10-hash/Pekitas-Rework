import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductBySlug, getPublishedProducts } from "@/lib/catalog-data";
import { getSiteSettings } from "@/lib/site-data";
import { ProductDetail } from "@/app/(site)/productos/[slug]/product-detail";
import { ProductCard } from "@/components/site/product-card";

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
  const relatedProducts = product.category_id
    ? (await getPublishedProducts(product.category_id)).filter((p) => p.id !== product.id).slice(0, 4)
    : [];

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

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/" className="hover:text-stone-800">
          Inicio
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/productos" className="hover:text-stone-800">
          Catálogo
        </Link>
        {product.categories && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/productos?categoria=${product.category_id}`} className="hover:text-stone-800">
              {product.categories.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-stone-700">{product.name}</span>
      </nav>

      <ProductDetail
        productId={product.id}
        slug={product.slug}
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

      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-stone-200 pt-10">
          <h2 className="font-[family-name:var(--font-fraunces)] mb-6 text-xl font-medium text-(--site-ink)">
            También te puede gustar
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

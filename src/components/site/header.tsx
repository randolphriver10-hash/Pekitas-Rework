import Image from "next/image";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { CategoryMegaMenu } from "@/components/site/category-mega-menu";
import { SiteMobileNav } from "@/components/site/mobile-nav";
import { SiteSearchBox } from "@/components/site/search-box";
import type { CategoryRow } from "@/lib/supabase/types";

export function SiteHeader({
  logoUrl,
  businessName,
  whatsappUrl,
  categories,
}: {
  logoUrl?: string;
  businessName: string;
  whatsappUrl: string | null;
  categories: CategoryRow[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-(--site-cream)/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <SiteMobileNav categories={categories} />
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={businessName}
                width={40}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            ) : (
              <span className="font-[family-name:var(--font-fraunces)] text-lg font-medium text-stone-800">
                {businessName}
              </span>
            )}
          </Link>
        </div>

        <nav className="hidden items-center gap-8 md:flex">
          <CategoryMegaMenu categories={categories} />
          <Link
            href="/#nosotros"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Nosotros
          </Link>
          <Link
            href="/#contacto"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
          >
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block">
            <SiteSearchBox />
          </div>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-rose-300/60 px-4 text-sm font-medium text-stone-800 shadow-sm transition-colors hover:bg-rose-300"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

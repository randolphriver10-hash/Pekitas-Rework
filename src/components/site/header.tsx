import Image from "next/image";
import Link from "next/link";
import { SiteMobileNav } from "@/components/site/mobile-nav";
import { SiteSearchBox } from "@/components/site/search-box";
import { CartSheet } from "@/components/site/cart-sheet";
import type { CategoryRow } from "@/lib/supabase/types";

export function SiteHeader({
  logoUrl,
  businessName,
  whatsappNumber,
  categories,
}: {
  logoUrl?: string;
  businessName: string;
  whatsappNumber: string | null;
  categories: CategoryRow[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-(--site-cream)/90 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-3 items-center px-4 sm:px-6">
        <div className="flex items-center">
          <SiteMobileNav categories={categories} />
        </div>

        <Link href="/" className="flex items-center justify-center">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={businessName}
              width={180}
              height={60}
              className="h-9 w-auto object-contain"
              priority
            />
          ) : (
            <span className="font-[family-name:var(--font-fraunces)] text-lg font-medium text-stone-800">
              {businessName}
            </span>
          )}
        </Link>

        <div className="flex items-center justify-end gap-4">
          <SiteSearchBox />
          <CartSheet whatsappNumber={whatsappNumber} />
        </div>
      </div>
    </header>
  );
}

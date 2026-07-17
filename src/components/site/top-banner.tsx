import Link from "next/link";
import type { BannerRow } from "@/lib/supabase/types";

export function TopBanner({ banner }: { banner: BannerRow }) {
  return (
    <div className="bg-(--site-blush-deep) text-white">
      <div className="mx-auto flex h-9 max-w-6xl items-center justify-center gap-3 px-4 text-xs sm:text-sm">
        <span className="truncate">{banner.message}</span>
        {banner.cta_text && banner.cta_url && (
          <Link href={banner.cta_url} className="shrink-0 font-medium underline underline-offset-2">
            {banner.cta_text}
          </Link>
        )}
      </div>
    </div>
  );
}

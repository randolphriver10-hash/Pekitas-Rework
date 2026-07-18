import Link from "next/link";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import type { SiteSettingsRow, SocialLinkRow } from "@/lib/supabase/types";

type FooterContent = { tagline?: string; copyright?: string };

export function SiteFooter({
  settings,
  content,
  socialLinks,
  whatsappUrl,
}: {
  settings: SiteSettingsRow | null;
  content: FooterContent;
  socialLinks: SocialLinkRow[];
  whatsappUrl: string | null;
}) {
  return (
    <footer id="contacto" className="border-t border-stone-200/70 bg-(--site-beige)/50">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-[family-name:var(--font-fraunces)] text-lg font-medium text-(--site-ink)">
              {settings?.business_name}
            </h3>
            {(content.tagline ?? settings?.description) && (
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {content.tagline ?? settings?.description}
              </p>
            )}
          </div>

          <div className="space-y-2 text-sm text-stone-600">
            <p className="mb-2 font-medium text-stone-800">Ayuda</p>
            <Link href="/productos" className="block hover:text-stone-900">
              Catálogo
            </Link>
            <Link href="/#faqs" className="block hover:text-stone-900">
              Preguntas frecuentes
            </Link>
            <Link href="/#nosotros" className="block hover:text-stone-900">
              Sobre nosotros
            </Link>
            {settings?.catalog_url && (
              <a
                href={settings.catalog_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:text-stone-900"
              >
                Catálogo descargable
              </a>
            )}
          </div>

          <div className="space-y-2 text-sm text-stone-600">
            <p className="mb-2 font-medium text-stone-800">Contacto</p>
            {settings?.address && (
              <a
                href={settings.maps_url ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 hover:text-stone-900"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {settings.address}
              </a>
            )}
            {settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 hover:text-stone-900"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {settings.email}
              </a>
            )}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-stone-900"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                WhatsApp
              </a>
            )}
          </div>

          <div className="space-y-2 text-sm text-stone-600">
            <p className="mb-2 font-medium text-stone-800">Seguinos</p>
            {socialLinks.length > 0 ? (
              socialLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block capitalize hover:text-stone-900"
                >
                  {link.platform}
                </a>
              ))
            ) : (
              <p className="text-stone-400">Próximamente</p>
            )}
          </div>
        </div>

        <p className="mt-10 border-t border-stone-200/70 pt-6 text-xs text-stone-500">
          {content.copyright}
        </p>
      </div>
    </footer>
  );
}

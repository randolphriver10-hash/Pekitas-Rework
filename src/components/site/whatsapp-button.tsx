import { MessageCircle } from "lucide-react";

export function WhatsAppFloatingButton({ whatsappUrl }: { whatsappUrl: string | null }) {
  if (!whatsappUrl) return null;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      className="fixed right-5 bottom-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition-transform hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}

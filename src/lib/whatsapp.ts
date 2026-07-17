/**
 * Arma un link wa.me. El número debe estar en formato internacional sin "+" ni
 * espacios (ej. 5491161193179), que es como se pide guardarlo en el admin.
 */
export function buildWhatsAppUrl(
  whatsappNumber: string | null | undefined,
  message?: string
): string | null {
  if (!whatsappNumber) return null;
  const digitsOnly = whatsappNumber.replace(/\D/g, "");
  if (!digitsOnly) return null;

  const url = new URL(`https://wa.me/${digitsOnly}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}

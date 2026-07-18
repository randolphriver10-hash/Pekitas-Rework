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

export type CartOrderLine = {
  name: string;
  size: string | null;
  color: string | null;
  quantity: number;
  price: number;
};

/** Arma el mensaje de WhatsApp con el detalle del pedido armado en el carrito. */
export function buildCartOrderMessage(items: CartOrderLine[]): string {
  const lines = items.map((item) => {
    const variant = [item.size, item.color].filter(Boolean).join(" / ");
    const subtotal = item.quantity * item.price;
    return `• ${item.name}${variant ? ` (${variant})` : ""} x${item.quantity} — $${subtotal.toLocaleString("es-AR")}`;
  });
  const total = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  return [
    "¡Hola! Quería hacer este pedido:",
    "",
    ...lines,
    "",
    `Total: $${total.toLocaleString("es-AR")}`,
  ].join("\n");
}

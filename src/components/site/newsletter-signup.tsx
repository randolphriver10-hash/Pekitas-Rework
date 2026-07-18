"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { subscribeNewsletterAction } from "@/components/site/newsletter-actions";

export function NewsletterSignup() {
  const [state, formAction, isPending] = useActionState(subscribeNewsletterAction, undefined);

  if (state?.success) {
    return (
      <p className="text-sm font-medium text-(--site-ink)">
        ¡Gracias por sumarte! Te vamos a avisar de nuevas colecciones y ofertas.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
      <input type="hidden" name="segment" value="general" />
      <div className="relative flex-1">
        <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-stone-400" />
        <input
          type="email"
          name="email"
          required
          placeholder="tu@email.com"
          className="h-11 w-full rounded-full border border-stone-300 bg-white/70 pr-4 pl-9 text-sm outline-none focus:border-(--site-ink)"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="h-11 shrink-0 rounded-full bg-(--site-ink) px-6 text-sm font-medium text-white disabled:opacity-60"
      >
        {isPending ? "Enviando..." : "Suscribirme"}
      </button>
      {state?.error && <p className="text-xs text-red-600 sm:absolute sm:mt-12">{state.error}</p>}
    </form>
  );
}

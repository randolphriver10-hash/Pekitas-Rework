import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toCsv } from "@/lib/csv";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("email, segment, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "No se pudo exportar." }, { status: 500 });

  const csv = toCsv(data ?? [], ["email", "segment", "is_active", "created_at"]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=newsletter-suscriptores.csv",
    },
  });
}

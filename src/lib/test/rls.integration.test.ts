// Test de integración liviano: pega directo a Supabase con la anon key (misma
// que usa la landing) para verificar que las políticas RLS reales siguen
// vigentes — no alcanza con mockear el cliente, porque un bug de RLS no se ve
// en el código, se ve en lo que la base efectivamente deja leer/escribir.
import { describe, it, expect } from "vitest";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

describe.skipIf(!url || !anonKey)("RLS anónima (anon key real)", () => {
  const supabase = createClient(url!, anonKey!);

  it("no puede leer la columna cost de products", async () => {
    const { error } = await supabase.from("products").select("cost").limit(1);
    expect(error).not.toBeNull();
  });

  it("puede leer las columnas públicas de products", async () => {
    const { error } = await supabase.from("products").select("id, name, price, stock").limit(1);
    expect(error).toBeNull();
  });

  it("no ve productos en estado draft", async () => {
    const { data } = await supabase
      .from("products")
      .select("id")
      .eq("status", "draft")
      .is("deleted_at", null);
    expect(data).toEqual([]);
  });

  it("no ve productos con deleted_at seteado", async () => {
    const { data } = await supabase
      .from("products")
      .select("id")
      .not("deleted_at", "is", null);
    expect(data).toEqual([]);
  });

  it("no puede insertar en products (sin sesión)", async () => {
    const { error } = await supabase
      .from("products")
      .insert({ name: "x", slug: `rls-test-${Date.now()}`, price: 1, stock: 0 });
    expect(error).not.toBeNull();
  });
});

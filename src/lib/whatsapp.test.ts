import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("buildWhatsAppUrl", () => {
  it("builds a wa.me link from a plain digit number", () => {
    expect(buildWhatsAppUrl("5491161193179")).toBe("https://wa.me/5491161193179");
  });

  it("strips non-digit characters (spaces, dashes, plus sign)", () => {
    expect(buildWhatsAppUrl("+54 9 11 6119-3179")).toBe("https://wa.me/5491161193179");
  });

  it("appends the message as a URL-encoded text param when provided", () => {
    const url = buildWhatsAppUrl("5491161193179", "Hola! Consulto por este producto");
    expect(url).toBe(
      "https://wa.me/5491161193179?text=Hola%21+Consulto+por+este+producto"
    );
  });

  it("returns null when there is no number", () => {
    expect(buildWhatsAppUrl(null)).toBeNull();
    expect(buildWhatsAppUrl(undefined)).toBeNull();
    expect(buildWhatsAppUrl("")).toBeNull();
  });

  it("returns null when the number has no digits", () => {
    expect(buildWhatsAppUrl("abc")).toBeNull();
  });
});

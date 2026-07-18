import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/validations/catalog";

describe("slugify", () => {
  it("lowercases and hyphenates spaces", () => {
    expect(slugify("Remera Manga Larga")).toBe("remera-manga-larga");
  });

  it("strips accents", () => {
    expect(slugify("Pantalón Algodón")).toBe("pantalon-algodon");
  });

  it("collapses non-alphanumeric runs into a single hyphen", () => {
    expect(slugify("Talle  M/L (nuevo!)")).toBe("talle-m-l-nuevo");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -Oferta especial- ")).toBe("oferta-especial");
  });
});

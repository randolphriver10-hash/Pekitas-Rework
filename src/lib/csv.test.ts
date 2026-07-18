import { describe, it, expect } from "vitest";
import { toCsv, parseCsv } from "@/lib/csv";

describe("toCsv", () => {
  it("writes a header row followed by data rows in column order", () => {
    const csv = toCsv([{ b: "2", a: "1" }], ["a", "b"]);
    expect(csv).toBe("a,b\n1,2");
  });

  it("quotes cells containing commas, quotes or newlines", () => {
    const csv = toCsv([{ name: 'Talle "M", azul' }], ["name"]);
    expect(csv).toBe('name\n"Talle ""M"", azul"');
  });

  it("renders null/undefined as an empty cell", () => {
    const csv = toCsv([{ a: null, b: undefined }], ["a", "b"]);
    expect(csv).toBe("a,b\n,");
  });
});

describe("parseCsv", () => {
  it("round-trips a simple table", () => {
    const rows = parseCsv("name,price\nRemera,1000\nBuzo,2500");
    expect(rows).toEqual([
      { name: "Remera", price: "1000" },
      { name: "Buzo", price: "2500" },
    ]);
  });

  it("handles quoted cells with embedded commas and escaped quotes", () => {
    const rows = parseCsv('name\n"Talle ""M"", azul"');
    expect(rows).toEqual([{ name: 'Talle "M", azul' }]);
  });

  it("returns an empty array for a header-only or empty file", () => {
    expect(parseCsv("name,price")).toEqual([]);
    expect(parseCsv("")).toEqual([]);
  });

  it("round-trips values produced by toCsv", () => {
    const original = [{ name: "Conjunto, verano \"corto\"", price: "1500" }];
    const csv = toCsv(original, ["name", "price"]);
    expect(parseCsv(csv)).toEqual(original);
  });
});

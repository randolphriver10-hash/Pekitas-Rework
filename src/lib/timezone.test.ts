import { describe, it, expect } from "vitest";
import { toArDatetimeLocal, arDatetimeLocalToUtcIso } from "@/lib/timezone";

// Buenos Aires es UTC-3 todo el año (sin horario de verano desde 2009).

describe("toArDatetimeLocal", () => {
  it("converts a UTC ISO string to AR local datetime-local value", () => {
    expect(toArDatetimeLocal("2024-01-15T15:30:00.000Z")).toBe("2024-01-15T12:30");
  });

  it("returns an empty string for null/undefined", () => {
    expect(toArDatetimeLocal(null)).toBe("");
    expect(toArDatetimeLocal(undefined)).toBe("");
  });
});

describe("arDatetimeLocalToUtcIso", () => {
  it("converts an AR-local datetime-local value to UTC ISO", () => {
    expect(arDatetimeLocalToUtcIso("2024-01-15T12:30")).toBe("2024-01-15T15:30:00.000Z");
  });

  it("returns null for an empty/missing value", () => {
    expect(arDatetimeLocalToUtcIso("")).toBeNull();
    expect(arDatetimeLocalToUtcIso(null)).toBeNull();
  });

  it("round-trips through toArDatetimeLocal", () => {
    const original = "2024-06-01T00:00:00.000Z";
    expect(arDatetimeLocalToUtcIso(toArDatetimeLocal(original))).toBe(original);
  });
});

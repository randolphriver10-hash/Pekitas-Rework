import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const AR_TZ = "America/Argentina/Buenos_Aires";

/** ISO UTC -> valor para <input type="datetime-local"> en hora de Argentina. */
export function toArDatetimeLocal(isoUtc: string | null | undefined): string {
  if (!isoUtc) return "";
  return formatInTimeZone(isoUtc, AR_TZ, "yyyy-MM-dd'T'HH:mm");
}

/** Valor de <input type="datetime-local"> (interpretado como hora de Argentina) -> ISO UTC. */
export function arDatetimeLocalToUtcIso(localValue: string | null | undefined): string | null {
  if (!localValue) return null;
  return fromZonedTime(localValue, AR_TZ).toISOString();
}

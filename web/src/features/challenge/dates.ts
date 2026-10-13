/**
 * Calendar-date helpers. Dates are `YYYY-MM-DD` strings in the challenge's timezone,
 * so day math never shifts across daylight saving or the viewer's own timezone.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtc(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return Date.UTC(year!, month! - 1, day!);
}

/** Today's date in a timezone. */
export function todayIn(timeZone: string, now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

/** Minutes after midnight right now in a timezone. */
export function minuteOfDayIn(timeZone: string, now: Date = new Date()): number {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "numeric", hourCycle: "h23" })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return Number(parts.hour) * 60 + Number(parts.minute);
}

export function addDays(date: string, days: number): string {
  return new Date(toUtc(date) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS);
}

export function formatDate(date: string, options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(toUtc(date)));
}

/** `452` → `"7:32 AM"`. */
export function formatMinutes(minutes: number): string {
  const rounded = Math.round(minutes) % (24 * 60);
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  const period = hours < 12 ? "AM" : "PM";
  const displayHour = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHour}:${String(mins).padStart(2, "0")} ${period}`;
}

/** `7` → `"7 AM"`, `0` → `"12 AM"`. */
export function formatHour(hour: number): string {
  const period = hour < 12 ? "AM" : "PM";
  return `${hour % 12 === 0 ? 12 : hour % 12} ${period}`;
}

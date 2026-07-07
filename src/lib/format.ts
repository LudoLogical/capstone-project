/** Shared formatting helpers. */

export function money(n: number): string {
  if (n >= 1000 && n % 1000 === 0) return `$${(n / 1000).toLocaleString()}K`;
  if (n >= 10000) return `$${Math.round(n / 1000).toLocaleString()}K`;
  return `$${n.toLocaleString()}`;
}

export function moneyExact(n: number): string {
  return `$${n.toLocaleString()}`;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function shortDate(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

export function monthYear(d: Date): string {
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

/** e.g. "in 5 weeks", "in 3 days", "2 weeks ago". `now` defaults to today. */
export function relativeDue(target: Date, now = new Date("2026-07-07T00:00:00Z")): string {
  const ms = target.getTime() - now.getTime();
  const days = Math.round(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return "today";
  const past = days < 0;
  const a = Math.abs(days);
  let label: string;
  if (a < 14) label = `${a} day${a === 1 ? "" : "s"}`;
  else if (a < 60) label = `${Math.round(a / 7)} weeks`;
  else label = `${Math.round(a / 30)} months`;
  return past ? `${label} ago` : `in ${label}`;
}

export function periodLabel(start: Date, term: number): string {
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + term);
  return `${monthYear(start)} – ${monthYear(end)}`;
}

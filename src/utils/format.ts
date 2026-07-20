// The seed's dates are all UTC midnight (e.g. 2026-08-01T00:00:00Z). Formatting
// them without pinning a timezone renders whatever local day that instant falls
// on, which differs between the server (usually UTC -> "Aug 1") and the
// browser (e.g. America/New_York -> "Jul 31"). Under SSR that is a hydration
// mismatch: the two renders must be deterministic. Pinning UTC also happens to
// show the date the seed actually encodes.
export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * A long-form date, e.g. "June 6, 2026". Pinned to UTC for the same reason
 * `formatDate` is - the seed encodes UTC midnights and SSR must be deterministic.
 */
export function formatLongDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Initials for an avatar chip, e.g. "Hilltop Harvest" → "HH". */
export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Human phrasing for a grant's reporting cadence, in months. */
export function formatReportFrequency(months: number): string {
  if (months < 0) return "None required";
  if (months === 0) return "Single report";
  if (months === 12) return "Annually";
  return `Every ${months} months`;
}

export function formatCurrency(amount: number): string {
  if (amount >= 1000) {
    return `$${Math.round(amount / 1000)}K`;
  }
  return `$${amount}`;
}

export function formatCurrencyFull(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

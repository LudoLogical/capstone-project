import { DocumentSourceType, DOCUMENT_SOURCE_TYPES } from "@/types/constants";
import { InitiativeSource, InitiativeSourceKind } from "@/types/data";

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

/**
 * The file type of an uploaded document, read off its name, or `null` if it
 * isn't one we accept. A file picker's `accept` filter is only a hint - a user
 * can always override it in the OS dialog - so uploads are checked with this
 * wherever they are taken in.
 */
export function documentType(fileName: string): DocumentSourceType | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  return DOCUMENT_SOURCE_TYPES.find((t) => t === ext) ?? null;
}

/**
 * A hostname has to have at least one dot, end in a two-plus-letter TLD, and
 * use only characters that are legal in a domain label. `new URL()` alone is
 * too permissive for our purposes - it happily accepts "https://notaurl" - so
 * the host is checked separately.
 */
const HOSTNAME =
  /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/i;

/**
 * The user's text as a canonical webpage URL, or `null` if it isn't one.
 *
 * Typing a bare domain is the common case, so a missing scheme is filled in
 * with `https://` rather than rejected; an explicit scheme has to be http(s),
 * which keeps `javascript:` and `data:` out of the hrefs we later render.
 */
export function normalizeWebpageUrl(input: string): string | null {
  const trimmed = input.trim();
  // A URL can't contain raw whitespace, and catching it here keeps a pasted
  // sentence from being read as a hostname.
  if (!trimmed || /\s/.test(trimmed)) return null;

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed);
  if (hasScheme && !/^https?:\/\//i.test(trimmed)) return null;

  let url: URL;
  try {
    url = new URL(hasScheme ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  // Credentials in a URL are a phishing vector and never intended here.
  if (url.username || url.password) return null;
  if (!HOSTNAME.test(url.hostname)) return null;

  return url.href;
}

/**
 * A webpage URL as we show it to the user: the `https://` we added on the way
 * in is noise on screen, as is the trailing slash on a bare domain. The stored
 * value stays canonical - only the label is shortened.
 *
 * Strings that aren't http(s) URLs are returned untouched, so this is safe to
 * apply to a list that mixes links with file names.
 */
export function formatWebpageLabel(url: string): string {
  const withoutScheme = url.replace(/^https?:\/\//i, "");
  if (withoutScheme === url) return url;
  return withoutScheme.replace(/\/$/, "");
}

/**
 * How a source names itself on screen. The field to read varies by kind, and a
 * webpage's stored link is canonical (`https://example.org/`), which is more
 * than the user needs to read - so it's shortened here while the full link
 * stays available for anything that needs to navigate to it.
 *
 * Anywhere a source is listed, this is where its text comes from: the source
 * itself, never a copy of its label recorded elsewhere.
 */
export function sourceLabel(source: InitiativeSource): string {
  switch (source.kind) {
    case InitiativeSourceKind.Document:
      return source.name;
    case InitiativeSourceKind.Webpage:
      return formatWebpageLabel(source.link);
    case InitiativeSourceKind.Chat:
      return source.content;
  }
}

/** What kind of thing a source is, in a word. */
export function sourceKindLabel(kind: InitiativeSourceKind): string {
  switch (kind) {
    case InitiativeSourceKind.Document:
      return "Document";
    case InitiativeSourceKind.Webpage:
      return "Webpage";
    case InitiativeSourceKind.Chat:
      return "Conversation";
  }
}

/**
 * A `Datum`'s value written out with its unit.
 *
 * A unit is prose rather than a symbol ("% of adults", "sessions"), so it can't
 * simply be concatenated: a leading "%" belongs against the number while a word
 * needs a space before it. Thousands are grouped against an explicit locale,
 * like `formatCurrencyFull`, so the server and the browser agree.
 */
export function formatMeasure(value: number, unit?: string): string {
  const amount = value.toLocaleString("en-US");
  if (!unit) return amount;
  return unit.startsWith("%") ? `${amount}${unit}` : `${amount} ${unit}`;
}

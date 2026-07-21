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

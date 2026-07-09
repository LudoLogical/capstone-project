const SCRAPE_DEPTH = 1;

const PAGE_LINK_PATTERN =
  /<a\b[^>]*\bhref\s*=\s*["']\s*((?!(?:mailto:|tel:|javascript:))[^"'#]+)["']/gi;

const BLACKLIST = [
  /(?<=[\/.])facebook\.com/gi,
  /(?<=[\/.])instagram\.com/gi,
  /(?<=[\/.])twitter\.com/gi,
  /(?<=[\/.])x\.com/gi,
  /(?<=[\/.])bsky\.app/gi,
  /(?<=[\/.])threads\.net/gi,
  /(?<=[\/.])youtube\.com/gi,
  /(?<=[\/.])linkedin\.com/gi,
  /(?:log|sign)-*(?:[oi]n|up)/gi,
];

async function scrapeLinks(url: string): Promise<Set<string>> {
  const response = await fetch(url, { redirect: "follow" });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch "${url}": ${response.status} ${response.statusText}`,
    );
  }

  const html = await response.text();
  const links = new Set<string>();

  for (const match of html.matchAll(PAGE_LINK_PATTERN)) {
    const rawValue = match[1]?.trim();

    if (!rawValue) {
      continue;
    }

    if (
      BLACKLIST.some((pattern) => {
        pattern.lastIndex = 0;
        return pattern.test(rawValue);
      })
    ) {
      continue;
    }

    try {
      const absoluteUrl = new URL(rawValue, url).href;
      links.add(absoluteUrl);
    } catch {
      // Ignore invalid URLs
    }
  }

  return links;
}

async function resolveRedirects(url: string): Promise<string> {
  try {
    const headResponse = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
    });

    return headResponse.url || url;
  } catch {
    // Some servers reject HEAD; fall back to GET and still follow redirects.
    const getResponse = await fetch(url, { redirect: "follow" });
    return getResponse.url || url;
  }
}

export async function scrapeLinksAtDepth(startURL: string, depth: number) {
  let scrapedLinks = new Set<string>();
  let currentLinks = new Set<string>([startURL]);
  let nextLinks = new Set<string>();
  while (depth > 0) {
    for (const link of currentLinks) {
      try {
        nextLinks = nextLinks.union(await scrapeLinks(link));
      } catch {
        // Ignore invalid URLs
      }
    }
    scrapedLinks = scrapedLinks.union(currentLinks);
    currentLinks = nextLinks.difference(scrapedLinks);
    nextLinks.clear();
    depth--;
  }
  for (const link of currentLinks) {
    scrapedLinks.add(await resolveRedirects(link));
  }
  return scrapedLinks;
}

import { InitiativeSourceKind, type InitiativeSource } from "@/types/data";
import { formatWebpageLabel } from "@/utils/url";

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

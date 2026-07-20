import {
  InitiativeSourceKind,
  type InitiativeSource,
} from "@/types/data";
import { USER_DISPLAY_NAME } from "@/data/seed";
import { formatLongDate } from "@/utils/format";

/**
 * A repository row as the Profile screen displays it. `id` is presentation
 * identity only - InitiativeSource has none, and these rows are never
 * persisted (the page holds them in local state).
 */
export type RepositoryRow = {
  id: string;
  /** File name, URL, or the conversational fact itself. */
  label: string;
  date: string;
  /** Portal username who added it. */
  by: string;
};

/** The one field that stands in for a source's label differs per kind. */
export function sourceLabel(source: InitiativeSource): string {
  switch (source.kind) {
    case InitiativeSourceKind.Document:
      return source.name;
    case InitiativeSourceKind.Webpage:
      return source.link;
    case InitiativeSourceKind.Chat:
      return source.content;
  }
}

/** Adapt canonical sources into display rows, keyed `f1` / `l1` / `c1`. */
export function toRows(
  sources: InitiativeSource[],
  prefix: string,
): RepositoryRow[] {
  return sources.map((source, i) => ({
    id: `${prefix}${i + 1}`,
    label: sourceLabel(source),
    date: formatLongDate(source.creationTime),
    by: USER_DISPLAY_NAME[source.creator] ?? source.creator,
  }));
}

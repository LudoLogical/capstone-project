"use client";

/** A bulleted or numbered list with accent-coloured markers. */
export default function BulletList({
  items,
  ordered = false,
}: {
  items: string[];
  ordered?: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-2.5 text-sm leading-relaxed text-ink-body"
        >
          <span aria-hidden className="flex-none font-bold text-accent-ink-2">
            {ordered ? `${i + 1}.` : "•"}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </Tag>
  );
}

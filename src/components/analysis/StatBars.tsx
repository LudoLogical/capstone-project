"use client";

/**
 * One comparison bar. Purely presentational - `role` drives colour: "me" is
 * this org's value, "average"/"max" are county context, "other" is any further
 * reference point (e.g. a prior year).
 */
export type RueaBar = {
  label: string;
  value: number;
  unit: string;
  role: "me" | "average" | "max" | "other";
};

const BAR_COLORS: Record<string, string> = {
  me: "bg-accent",
  average: "bg-bar-average",
  max: "bg-bar-max",
  other: "bg-info-ink",
};

/**
 * The comparison bars in a RUEA card's "In context" section. Bars are scaled
 * against the largest value in the set, with a 4% floor so a small value still
 * reads as a bar rather than a sliver.
 */
export default function StatBars({ bars }: { bars: RueaBar[] }) {
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div className="flex flex-col gap-2.5">
      {bars.map((bar) => {
        const barColor = BAR_COLORS[bar.role];
        return (
          <div key={bar.label}>
            <div className="mb-1 flex justify-between text-xs">
              <span className="text-ink-muted">{bar.label}</span>
              <strong>
                {bar.value.toLocaleString()} {bar.unit}
              </strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-divider-2">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.max(4, (bar.value / max) * 100)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

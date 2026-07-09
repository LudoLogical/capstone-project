import type { RueaSection } from "@/data/seed";
import CiteButton from "./CiteButton";

const BAR_COLORS: Record<string, string> = {
  me: "var(--color-accent)",
  average: "#c4a882",
  max: "#7a6548",
  other: "var(--color-info-ink)",
};

function StatBars({ bars }: { bars: RueaSection["bars"] }) {
  const max = Math.max(...bars.map((b) => b.value));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {bars.map((bar) => (
        <div key={bar.label}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
            <span className="muted">{bar.label}</span>
            <strong>
              {bar.value.toLocaleString()} {bar.unit}
            </strong>
          </div>
          <div className="progress-track" style={{ background: "var(--color-divider-2)" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.max(4, (bar.value / max) * 100)}%`,
                borderRadius: "var(--radius-pill)",
                background: BAR_COLORS[bar.role],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

type RueaCardProps = {
  section: RueaSection;
  expanded: boolean;
  onToggle: () => void;
  onAdd?: () => void;
};

export default function RueaCard({ section, expanded, onToggle, onAdd }: RueaCardProps) {
  const { analysis } = section;
  const headline = analysis.datum.content;

  return (
    <div className="card" style={{ padding: 0, overflow: "hidden" }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 20px",
          border: "none",
          background: "#fff",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow" style={{ marginBottom: 4 }}>Remember</div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{headline}</div>
        </div>
        <div style={{ fontSize: 14, color: "var(--color-text-muted)" }}>{expanded ? "▲" : "▼"}</div>
      </button>

      {expanded && (
        <div style={{ padding: "0 20px 22px", borderTop: "1px solid var(--color-divider)" }}>
          <div style={{ marginTop: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>In other words</div>
            <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {analysis.result.understand.map((line, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-body)" }}>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ margin: "18px 0" }}>
            <div className="eyebrow" style={{ marginBottom: 10 }}>In context</div>
            <StatBars bars={section.bars} />
            <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--color-accent-ink)", marginTop: 10 }}>
              {section.evalNote}
            </p>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div className="eyebrow" style={{ marginBottom: 8 }}>In your application</div>
            <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {analysis.result.apply.map((line, i) => (
                <li key={i} style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-body)" }}>
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <CiteButton provenanceKey={section.provenanceKey} />
            {onAdd && (
              <button onClick={onAdd} className="btn btn-primary btn-sm">
                Add to my grant ✓
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

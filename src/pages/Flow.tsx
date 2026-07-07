import { useState } from "react";
import { useStore } from "../state/store";
import { C, mono } from "../theme";
import { BackButton } from "../components/ui";
import { Chart, Report, Info } from "../components/icons";
import { grantsList, currentOrg } from "../data";
import { grantVM } from "../lib/selectors";
import { relativeDue, periodLabel } from "../lib/format";
import {
  questionsFor,
  vizCardsFor,
  factsFor,
  analysisFor,
  type VizCard,
} from "../lib/flow";

export function Flow() {
  const s = useStore();
  const grant = grantsList.find((g) => g.id === s.nav.grantId) ?? grantsList[0];
  const mode = s.nav.flowMode ?? "write";
  const isReport = mode === "report";
  const vm = grantVM(grant);
  const record = currentOrg.grantRecords.get(grant.id);
  const analysis = analysisFor(record, mode);

  const questions = questionsFor(grant, mode);
  const vizCards = vizCardsFor(analysis);
  const facts = factsFor(analysis);

  const [q, setQ] = useState(0);
  const [attached, setAttached] = useState<Record<number, VizCard[]>>({});
  const current = questions[q];

  const answer = s.getAnswer(grant.id, q);
  const attachedHere = attached[q] ?? [];

  const embed = (v: VizCard) =>
    setAttached((prev) => {
      const list = prev[q] ?? [];
      if (list.some((x) => x.label === v.label)) return prev;
      return { ...prev, [q]: [...list, v] };
    });
  const removeViz = (label: string) =>
    setAttached((prev) => ({ ...prev, [q]: (prev[q] ?? []).filter((x) => x.label !== label) }));

  const prefillIfEmpty = () => {
    if (!answer && current.prefill) s.setAnswer(grant.id, q, current.prefill);
  };

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "30px 28px 90px", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
      <BackButton label="Dashboard" onClick={() => s.go("dashboard")} />

      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: mono,
            fontSize: 10.5,
            letterSpacing: ".06em",
            fontWeight: 700,
            padding: "5px 10px",
            borderRadius: 6,
            color: isReport ? C.amber : C.indigo,
            background: isReport ? C.amberSoft : C.indigoSoft,
          }}
        >
          {isReport ? "IMPACT REPORT" : "APPLICATION DRAFT"}
        </span>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>{vm.name}</h1>
      </div>
      <p style={{ color: C.sub, fontSize: 14, marginTop: 7, maxWidth: 720 }}>
        {isReport
          ? "Report on the award you won — pull straight from what you tracked, in your own words."
          : "Answer one question at a time. Everything is prefilled from your data and fully editable."}
      </p>

      {isReport && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 13, background: C.amber, color: "#fff", borderRadius: 13, padding: "14px 18px", marginTop: 16 }}>
            <Report size={22} color="#fff" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                You're reporting on a grant you won — not writing a new application
              </div>
              <div style={{ fontSize: 12.5, opacity: 0.92, marginTop: 1 }}>
                Reporting period {periodLabel(grant.timeline.applicationWindowStart, grant.timeline.awardTerm)} · due{" "}
                {relativeDue(grant.timeline.firstReportDeadline)}. Pull straight from what you tracked all year.
              </div>
            </div>
          </div>
          <div style={{ background: C.indigoSoft, border: `1px solid ${C.indigoBorder}`, borderRadius: 13, padding: "13px 16px", marginTop: 12, display: "flex", gap: 11, alignItems: "flex-start" }}>
            <Chart size={17} color={C.indigo} style={{ marginTop: 1 }} />
            <div style={{ fontSize: 12.5, color: C.indigo700, lineHeight: 1.5 }}>
              Your tracked measures are on the right. Drop a chart into any answer to embed it — the report is
              gathering what you already have, not starting over.
            </div>
          </div>
        </>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginTop: 20, alignItems: "start" }}>
        {/* doc column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted }}>
              Question {q + 1} of {questions.length}
            </div>
            <button
              onClick={() => s.go("brief", { grantId: grant.id, flowMode: mode })}
              style={{ background: "#fff", border: "1px solid #e2e6ec", color: C.sub, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
            >
              Review all &amp; gather brief
            </button>
          </div>

          <div style={{ display: "flex", gap: 5 }}>
            {questions.map((_, i) => (
              <div
                key={i}
                onClick={() => setQ(i)}
                title="Jump to this question"
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 6,
                  cursor: "pointer",
                  background:
                    i === q ? C.indigo : s.getAnswer(grant.id, i).trim() ? "#c7d2fe" : "#e7eaef",
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: 11, color: C.faint, marginTop: -4 }}>Tap the bar to jump to any question.</div>

          <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: 20, boxShadow: "0 1px 2px rgba(16,21,31,.04)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, lineHeight: 1.3 }}>{current.q}</div>
            <textarea
              value={answer}
              onFocus={prefillIfEmpty}
              onChange={(e) => s.setAnswer(grant.id, q, e.target.value)}
              placeholder="Write your answer in your own words…"
              style={{ width: "100%", marginTop: 13, border: "1px solid #e7eaef", borderRadius: 10, padding: "13px 14px", fontSize: 13.5, lineHeight: 1.6, minHeight: 150, resize: "vertical", outline: "none", background: "#fff" }}
            />

            {attachedHere.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {attachedHere.map((v) => (
                  <div key={v.label} style={{ border: "1px solid #d6e0ff", background: "#f7f9ff", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{v.label}</span>
                      <button
                        onClick={() => removeViz(v.label)}
                        title="Remove"
                        style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, background: "#eef0f3", border: "none", color: "#6b7280", fontSize: 13, cursor: "pointer" }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                      {v.bars.map((b) => (
                        <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 96, fontSize: 11, color: "#6b7280", textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {b.name}
                          </div>
                          <div style={{ flex: 1, height: 16, background: "#eceff3", borderRadius: 5, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${b.pct}%`, background: C.indigo, borderRadius: 5 }} />
                          </div>
                          <div style={{ minWidth: 44, fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>{b.val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 11, color: C.faint, marginTop: 8 }}>↳ {v.src}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ fontSize: 11, color: C.faint, marginTop: 9, display: "flex", alignItems: "center", gap: 6 }}>
              <Chart size={13} color="#b3bbc7" />
              Prefilled from your data — edit freely. Use “Embed” on a chart to drop it into your answer.
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <button
              onClick={() => setQ(Math.max(0, q - 1))}
              disabled={q === 0}
              style={{ background: "none", border: "none", color: q === 0 ? "#c7cdd8" : C.sub, fontSize: 13.5, fontWeight: 700, cursor: q === 0 ? "default" : "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              ← Previous
            </button>
            {q < questions.length - 1 ? (
              <button
                onClick={() => setQ(q + 1)}
                style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
              >
                Next question →
              </button>
            ) : (
              <button
                onClick={() => s.go("brief", { grantId: grant.id, flowMode: mode })}
                style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
              >
                Review &amp; gather into a brief →
              </button>
            )}
          </div>
        </div>

        {/* sidebar */}
        <div style={{ position: "sticky", top: 78 }}>
          <div style={{ background: "#fff", border: `1px solid ${C.indigoBorder}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 2px rgba(16,21,31,.04)" }}>
            <div style={{ padding: "15px 17px", borderBottom: "1px solid #eef0f3" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" style={{ animation: "ringPulse 2.6s ease-in-out infinite" }}>
                  <circle cx="12" cy="12" r="9" fill="none" stroke={C.indigo} strokeWidth="2" />
                </svg>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>Within reach</div>
              </div>
              <p style={{ fontSize: 11.5, color: "#6b7280", marginTop: 7, lineHeight: 1.5 }}>
                For: <span style={{ color: C.indigo, fontWeight: 600 }}>{current.q}</span>
              </p>
            </div>
            <div style={{ padding: "14px 15px", maxHeight: 520, overflowY: "auto", display: "flex", flexDirection: "column", gap: 11 }}>
              <SideHeading>Data visualizations · drop into your answer</SideHeading>
              {vizCards.length === 0 && (
                <div style={{ fontSize: 12, color: C.muted }}>No charts for this grant yet — add documents to surface more.</div>
              )}
              {vizCards.map((v) => (
                <div key={v.label} style={{ border: "1px solid #c7d2fe", background: "#f5f7ff", borderRadius: 12, padding: "13px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{v.label}</span>
                    <button
                      onClick={() => s.setModal({ kind: "sourceInfo", title: v.label, detail: `Compared against the regional benchmark for this measure.`, origin: v.src })}
                      title="Source details"
                      style={{ flexShrink: 0, width: 18, height: 18, borderRadius: "50%", background: "#e0e7ff", color: C.indigo, border: "none", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
                    >
                      i
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 9 }}>
                    {v.bars.map((b) => (
                      <div key={b.name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 56, fontSize: 9.5, color: C.muted, textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {b.name}
                        </div>
                        <div style={{ flex: 1, height: 11, background: "#e7eaef", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${b.pct}%`, background: C.indigo, borderRadius: 4 }} />
                        </div>
                        <div style={{ width: 40, fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{b.val}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 7 }}>↳ {v.src}</div>
                  <button
                    onClick={() => embed(v)}
                    style={{ marginTop: 8, background: C.indigo, color: "#fff", border: "none", borderRadius: 7, padding: "5px 10px", fontSize: 10.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Embed in answer
                  </button>
                </div>
              ))}

              <div style={{ height: 1, background: "#eef0f3", margin: "3px 0" }} />
              <SideHeading>Facts · for reference</SideHeading>
              {facts.map((f, i) => (
                <div key={i} style={{ border: "1px solid #eef0f3", background: "#fbfcfd", borderRadius: 12, padding: "12px 13px" }}>
                  <div style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: ".05em", color: C.indigo }}>{f.tag}</div>
                  <div style={{ fontSize: 12.5, color: C.body, marginTop: 5, lineHeight: 1.4 }}>{f.value}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
                    <div style={{ fontSize: 11, color: C.faint, lineHeight: 1.45, flex: 1, minWidth: 0 }}>↳ {f.source}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "11px 15px", borderTop: "1px solid #eef0f3", fontSize: 10.5, color: C.faint, lineHeight: 1.5, display: "flex", gap: 7, alignItems: "flex-start" }}>
              <Info size={13} color="#b3bbc7" style={{ marginTop: 1 }} />
              <span>Surfaced from your own data, with its source. Nothing you type is shared or sent.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideHeading({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 9.5, letterSpacing: ".06em", textTransform: "uppercase", color: C.muted }}>
      {children}
    </div>
  );
}

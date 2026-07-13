import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { ReportState } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import { DATA_DETAILS, REPORT_QUESTION_STEPS, RUEA_SECTIONS } from "@/data/seed";
import CheckboxRow from "@/components/CheckboxRow";
import ReportQuestionStep from "@/components/ReportQuestionStep";
import RueaCard from "@/components/RueaCard";
import Modal from "@/components/Modal";

const STEP_NAV = [
  { n: 1, label: "Share your context" },
  { n: 2, label: "Commitment" },
  { n: 3, label: "Events run" },
  { n: 4, label: "Community served" },
  { n: 5, label: "Outcomes" },
  { n: 6, label: "Supporting data" },
  { n: 7, label: "Analysis" },
];

const SUPPORTING_YOUR_DATA = ["ruea-served", "ruea-retention"];
const SUPPORTING_VP_DATA = ["ruea-cvd", "ruea-produce"];

type QuestionStepId = keyof ReportState["chat"];

const QUESTION_STEP_ID_BY_INDEX: Record<number, QuestionStepId> = {
  2: "commitment",
  3: "events",
  4: "community",
  5: "outcomes",
};

export default function ReportFlowPage() {
  const { grantId = "" } = useParams();
  const navigate = useNavigate();
  const view = useGrantView(grantId);
  const report = useAppStore((s) => s.getReport(grantId));
  const updateReport = useAppStore((s) => s.updateReport);
  const addToast = useAppStore((s) => s.addToast);
  const [urlDraft, setUrlDraft] = useState("");
  const [dataModalKey, setDataModalKey] = useState<string | null>(null);

  if (!view) return null;
  const { grant } = view;

  const setStep = (step: number) => updateReport(grantId, (r) => ({ ...r, step }));
  const toggleShare = (key: keyof ReportState["share"]) =>
    updateReport(grantId, (r) => ({ ...r, share: { ...r.share, [key]: !r.share[key] } }));
  const addUpload = () => {
    if (!urlDraft.trim()) return;
    updateReport(grantId, (r) => ({ ...r, uploads: [...r.uploads, urlDraft.trim()] }));
    setUrlDraft("");
  };
  const toggleSupporting = (id: string) =>
    updateReport(grantId, (r) => ({ ...r, supportingPicks: { ...r.supportingPicks, [id]: !r.supportingPicks[id] } }));
  const toggleAnalysis = (id: string) =>
    updateReport(grantId, (r) => ({ ...r, analysisExpanded: { ...r.analysisExpanded, [id]: !r.analysisExpanded[id] } }));

  const questionStepId = QUESTION_STEP_ID_BY_INDEX[report.step];
  const dataModal = dataModalKey ? DATA_DETAILS[dataModalKey] : null;

  const selectedSupporting = RUEA_SECTIONS.filter((s) => report.supportingPicks[s.id]);
  const analysisSections = selectedSupporting.length > 0 ? selectedSupporting : RUEA_SECTIONS;
  const currentCard = analysisSections[report.analysisCardIndex % analysisSections.length];

  const saveToGrant = () => {
    addToast("Report saved to grant.");
    navigate("/dashboard");
  };

  return (
    <div className="page-wide page-enter">
      <button onClick={() => navigate("/dashboard")} className="back-link">
        ← Back to dashboard
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 28, alignItems: "start" }}>
        <aside className="card" style={{ position: "sticky", top: 88, padding: 18 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{grant.purpose.split(".")[0]}</div>
          <button onClick={() => addToast("Opening Account Profile data manager...")} className="btn-link" style={{ marginBottom: 16, display: "inline-block" }}>
            Manage my Data
          </button>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {STEP_NAV.map((s) => (
              <button
                key={s.n}
                onClick={() => setStep(s.n)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  padding: "8px 6px",
                  textAlign: "left",
                  fontFamily: "var(--font-ui)",
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    fontWeight: 700,
                    background: report.step === s.n ? "var(--color-accent)" : report.step > s.n ? "var(--color-success-ink-2)" : "var(--color-divider-2)",
                    color: report.step >= s.n ? "#fff" : "var(--color-text-muted)",
                  }}
                >
                  {report.step > s.n ? "✓" : s.n}
                </div>
                <span style={{ fontSize: 13, fontWeight: report.step === s.n ? 700 : 500, color: report.step === s.n ? "var(--color-text)" : "var(--color-text-muted)" }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div>
          {report.step === 1 && (
            <div>
              <h1 className="h2-serif" style={{ fontSize: 26, marginBottom: 8 }}>
                Share your context
              </h1>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-muted)", marginBottom: 20 }}>
                Nothing is used without your permission. Check what the AI can read for this report.
              </p>
              <div className="card" style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
                {(["surveys", "budget", "orgAssess"] as const).map((key) => {
                  const d = DATA_DETAILS[key];
                  return (
                    <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <CheckboxRow checked={report.share[key]} onToggle={() => toggleShare(key)} label={d.label} hint={d.meta} />
                      <button onClick={() => setDataModalKey(key)} className="btn btn-secondary btn-sm">
                        {d.completed ? "View summary" : "Open form"}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 10 }}>Active files collection</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <input
                    value={urlDraft}
                    onChange={(e) => setUrlDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addUpload()}
                    placeholder="Paste a link, or type a file name"
                    aria-label="Upload a file or paste a link"
                    className="input"
                  />
                  <button onClick={addUpload} className="btn btn-secondary">
                    Add
                  </button>
                </div>
                {report.uploads.length > 0 && (
                  <div className="tag-row">
                    {report.uploads.map((u, i) => (
                      <span key={i} className="pill pill-neutral">
                        📎 {u}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => setStep(2)} className="btn btn-primary">
                Next →
              </button>
            </div>
          )}

          {questionStepId &&
            (() => {
              const stepDef = REPORT_QUESTION_STEPS.find((q) => q.id === questionStepId)!;
              const chat = report.chat[questionStepId];
              return (
                <div>
                  <ReportQuestionStep
                    stepDef={stepDef}
                    chat={chat}
                    onTogglePick={(itemId) =>
                      updateReport(grantId, (r) => ({
                        ...r,
                        chat: {
                          ...r.chat,
                          [questionStepId]: {
                            ...r.chat[questionStepId],
                            picks: { ...r.chat[questionStepId].picks, [itemId]: !r.chat[questionStepId].picks[itemId] },
                          },
                        },
                      }))
                    }
                    onSend={(text) =>
                      updateReport(grantId, (r) => ({
                        ...r,
                        chat: {
                          ...r.chat,
                          [questionStepId]: {
                            ...r.chat[questionStepId],
                            messages: [
                              ...r.chat[questionStepId].messages,
                              { from: "user", text },
                              { from: "ai", text: "Got it — added to your report draft." },
                            ],
                          },
                        },
                      }))
                    }
                    onMarkComplete={() =>
                      updateReport(grantId, (r) => ({
                        ...r,
                        chat: { ...r.chat, [questionStepId]: { ...r.chat[questionStepId], marked: !r.chat[questionStepId].marked } },
                      }))
                    }
                  />
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button onClick={() => setStep(report.step - 1)} className="btn btn-secondary">
                      Back
                    </button>
                    <button onClick={() => setStep(report.step + 1)} className="btn btn-primary">
                      Next →
                    </button>
                  </div>
                </div>
              );
            })()}

          {report.step === 6 && (
            <div>
              <h1 className="h2-serif" style={{ fontSize: 26, marginBottom: 8 }}>
                Supporting data we found
              </h1>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-muted)", marginBottom: 20 }}>
                Select which data points to include as citable evidence in your report.
              </p>

              <div className="eyebrow" style={{ marginBottom: 10 }}>Your data</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {SUPPORTING_YOUR_DATA.map((id) => {
                  const s = RUEA_SECTIONS.find((x) => x.id === id)!;
                  return <SupportingCard key={id} section={s} picked={!!report.supportingPicks[id]} onToggle={() => toggleSupporting(id)} />;
                })}
              </div>

              <div className="eyebrow" style={{ marginBottom: 10 }}>Vibrancy Portal data</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                {SUPPORTING_VP_DATA.map((id) => {
                  const s = RUEA_SECTIONS.find((x) => x.id === id)!;
                  return <SupportingCard key={id} section={s} picked={!!report.supportingPicks[id]} onToggle={() => toggleSupporting(id)} />;
                })}
              </div>

              <div style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 20 }}>
                Surfaced indices: {Object.values(report.supportingPicks).filter(Boolean).length} included
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(5)} className="btn btn-secondary">
                  Back
                </button>
                <button onClick={() => setStep(7)} className="btn btn-primary">
                  Next →
                </button>
              </div>
            </div>
          )}

          {report.step === 7 && (
            <div>
              <h1 className="h2-serif" style={{ fontSize: 26, marginBottom: 8 }}>
                Analysis
              </h1>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-muted)", marginBottom: 20 }}>
                Remember the number, understand what it means, see it in context, and use it in your report.
              </p>

              {currentCard && (
                <>
                  <RueaCard
                    section={currentCard}
                    expanded={!!report.analysisExpanded[currentCard.id]}
                    onToggle={() => toggleAnalysis(currentCard.id)}
                  />
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, margin: "16px 0" }}>
                    {analysisSections.map((s, i) => (
                      <div
                        key={s.id}
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: i === report.analysisCardIndex % analysisSections.length ? "var(--color-accent)" : "var(--color-divider-2)",
                        }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => updateReport(grantId, (r) => ({ ...r, analysisCardIndex: r.analysisCardIndex + 1 }))}
                    className="btn btn-secondary btn-sm"
                    style={{ marginBottom: 24 }}
                  >
                    next →
                  </button>
                </>
              )}

              <div className="card" style={{ marginBottom: 24 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Next steps</div>
                <ul style={{ paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                  <li style={{ fontSize: 13.5 }}>Copy language from the cards above into your narrative</li>
                  <li style={{ fontSize: 13.5 }}>Use the citations when a funder asks for a data source</li>
                  <li style={{ fontSize: 13.5 }}>Go back to add more data if something's missing</li>
                  <li style={{ fontSize: 13.5 }}>Export this report as a reference document</li>
                </ul>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setStep(6)} className="btn btn-secondary">
                  Back
                </button>
                <button onClick={saveToGrant} className="btn btn-primary">
                  Save to grant →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {dataModal && (
        <Modal open onClose={() => setDataModalKey(null)} title={dataModal.label} maxWidth={480}>
          {dataModal.summary ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dataModal.summary.map((row) => (
                <div key={row.question}>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 3 }}>{row.question}</div>
                  <div style={{ fontSize: 14.5, fontWeight: 600 }}>{row.answer}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {dataModal.formFields?.map((f) => (
                <div key={f.label}>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 4 }}>{f.label}</div>
                  <input className="input" placeholder={f.placeholder} />
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

function SupportingCard({
  section,
  picked,
  onToggle,
}: {
  section: (typeof RUEA_SECTIONS)[number];
  picked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={picked}
      className="card"
      style={{
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 14,
        cursor: "pointer",
        padding: 16,
        borderColor: picked ? "var(--color-accent)" : undefined,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: `2px solid ${picked ? "var(--color-accent)" : "#cdbfb2"}`,
          background: picked ? "var(--color-accent)" : "transparent",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          flex: "0 0 auto",
        }}
      >
        {picked ? "✓" : ""}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{section.analysis.datum.content}</div>
        <div style={{ fontSize: 11.5, color: "var(--color-text-faint)", fontFamily: "monospace" }}>
          {section.analysis.datum.citation}
        </div>
      </div>
    </button>
  );
}

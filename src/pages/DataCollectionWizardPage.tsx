import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useGrantView } from "@/store/derived";
import { DATA_DETAILS, RUEA_SECTIONS } from "@/data/seed";
import CheckboxRow from "@/components/CheckboxRow";
import RueaCard from "@/components/RueaCard";
import Modal from "@/components/Modal";

const STEP_LABELS = ["Share your context", "Data we found", "Explain my data"];

export default function DataCollectionWizardPage() {
  const { grantId = "" } = useParams();
  const navigate = useNavigate();
  const view = useGrantView(grantId);
  const wizard = useAppStore((s) => s.getWizard(grantId));
  const updateWizard = useAppStore((s) => s.updateWizard);
  const addToast = useAppStore((s) => s.addToast);
  const [urlDraft, setUrlDraft] = useState("");
  const [dataModalKey, setDataModalKey] = useState<string | null>(null);

  if (!view) return null;
  const { grant } = view;

  const setStep = (step: number) => updateWizard(grantId, (w) => ({ ...w, step }));

  const toggleShare = (key: keyof typeof wizard.share) =>
    updateWizard(grantId, (w) => ({ ...w, share: { ...w.share, [key]: !w.share[key] } }));

  const addUpload = () => {
    if (!urlDraft.trim()) return;
    updateWizard(grantId, (w) => ({ ...w, uploads: [...w.uploads, urlDraft.trim()] }));
    setUrlDraft("");
  };

  const toggleFound = (id: string) =>
    updateWizard(grantId, (w) => ({ ...w, found: { ...w.found, [id]: !w.found[id] } }));

  const toggleRuea = (id: string) =>
    updateWizard(grantId, (w) => ({ ...w, rueaExpanded: { ...w.rueaExpanded, [id]: !w.rueaExpanded[id] } }));

  const finish = () => {
    addToast("Supporting data added to your grant.");
    navigate("/dashboard");
  };

  const foundSections = RUEA_SECTIONS.filter((s) => wizard.found[s.id]);
  const dataModal = dataModalKey ? DATA_DETAILS[dataModalKey] : null;

  return (
    <div className="page-narrow page-enter">
      <button onClick={() => (wizard.step === 1 ? navigate(`/grants/${grant.id}`) : setStep(wizard.step - 1))} className="back-link">
        ← Back
      </button>

      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {STEP_LABELS.map((label, i) => (
          <div key={label} style={{ flex: 1 }}>
            <div className="progress-track" style={{ marginBottom: 6 }}>
              <div
                className="progress-fill"
                style={{ width: wizard.step > i ? "100%" : wizard.step === i + 1 ? "50%" : "0%" }}
              />
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{label}</div>
          </div>
        ))}
      </div>

      {wizard.step === 1 && (
        <div>
          <h1 className="h2-serif" style={{ fontSize: 26, marginBottom: 8 }}>
            Share your context (optional)
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-muted)", marginBottom: 20 }}>
            The AI only reads what you check below. Your data remains private and is never used to train our AI.
          </p>

          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Vibrancy Portal data
          </div>
          <div className="card" style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {(["surveys", "budget", "orgAssess"] as const).map((key) => {
              const d = DATA_DETAILS[key];
              return (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <CheckboxRow checked={wizard.share[key]} onToggle={() => toggleShare(key)} label={d.label} hint={d.meta} />
                  <button onClick={() => setDataModalKey(key)} className="btn btn-secondary btn-sm">
                    {d.completed ? "View summary" : "Open form"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="eyebrow" style={{ marginBottom: 10 }}>
            Your own initiative data
          </div>
          <div className="card" style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 14 }}>
              Attendance sheets, surveys, photos, past reports, participant counts, or letters of support all help.
            </p>
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
            {wizard.uploads.length > 0 && (
              <div className="tag-row">
                {wizard.uploads.map((u, i) => (
                  <span key={i} className="pill pill-neutral">
                    📎 {u}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(2)} className="btn btn-primary">
              Next →
            </button>
            <button onClick={() => setStep(2)} className="btn btn-secondary">
              Skip this step
            </button>
          </div>
        </div>
      )}

      {wizard.step === 2 && (
        <div>
          <h1 className="h2-serif" style={{ fontSize: 26, marginBottom: 8 }}>
            Supporting data we found
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-muted)", marginBottom: 20 }}>
            Based on what you shared, here's what could help support this application. Pick what's relevant.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {RUEA_SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleFound(s.id)}
                aria-pressed={!!wizard.found[s.id]}
                className="card"
                style={{
                  textAlign: "left",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  padding: 16,
                  borderColor: wizard.found[s.id] ? "var(--color-accent)" : undefined,
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.analysis.datum.content}</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{s.analysis.datum.citation}</div>
                </div>
                <div style={{ fontSize: 16 }}>{wizard.found[s.id] ? "✓" : "+"}</div>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary">
              Back
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary">
              Explain my data →
            </button>
          </div>
        </div>
      )}

      {wizard.step === 3 && (
        <div>
          <h1 className="h2-serif" style={{ fontSize: 26, marginBottom: 8 }}>
            Your supporting data, explained
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--color-text-muted)", marginBottom: 20 }}>
            Remember the number, understand what it means, see it in context, and use it in your application.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
            {foundSections.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
                Go back and select at least one data point to see it explained here.
              </p>
            ) : (
              foundSections.map((s) => (
                <RueaCard
                  key={s.id}
                  section={s}
                  expanded={!!wizard.rueaExpanded[s.id]}
                  onToggle={() => toggleRuea(s.id)}
                  onAdd={finish}
                />
              ))
            )}
          </div>
          <button onClick={() => setStep(2)} className="btn btn-secondary">
            Back
          </button>
        </div>
      )}

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

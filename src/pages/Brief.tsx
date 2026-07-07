import { useStore } from "../state/store";
import { C, mono } from "../theme";
import { BackButton } from "../components/ui";
import { Check, Doc } from "../components/icons";
import { grantsList, currentOrg } from "../data";
import { grantVM } from "../lib/selectors";
import { questionsFor, analysisFor, factsFor, vizCardsFor } from "../lib/flow";

export function Brief() {
  const s = useStore();
  const grant = grantsList.find((g) => g.id === s.nav.grantId) ?? grantsList[0];
  const mode = s.nav.flowMode ?? "write";
  const vm = grantVM(grant);
  const record = currentOrg.grantRecords.get(grant.id);
  const analysis = analysisFor(record, mode);
  const questions = questionsFor(grant, mode);

  const answered = questions.filter((_, i) => s.getAnswer(grant.id, i).trim()).length;
  const sources = [
    ...vizCardsFor(analysis).map((v) => v.src),
    ...factsFor(analysis).map((f) => f.source),
  ];

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "34px 28px 90px", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
      <BackButton
        label="Back to editing"
        onClick={() => s.go("flow", { grantId: grant.id, flowMode: mode })}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: C.indigoSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Doc size={20} color={C.indigo} />
        </div>
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>
            {mode === "report" ? "Impact report brief" : "Application brief"}
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>{vm.name}</h1>
        </div>
      </div>
      <p style={{ color: C.sub, fontSize: 14, marginTop: 10, lineHeight: 1.55 }}>
        A reference gathering of everything you've written, in your own words, with the data you leaned on.{" "}
        <strong style={{ color: C.ink }}>{answered} of {questions.length} sections drafted.</strong> Copy it into the
        funder's form — nothing is submitted from here.
      </p>

      <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: "28px 30px", marginTop: 20, boxShadow: "0 1px 2px rgba(16,21,31,.04)" }}>
        <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "-.01em" }}>{vm.name}</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
          {vm.funder} · Prepared by Riverside Greenway Project
        </div>
        <div style={{ height: 1, background: "#edf0f4", margin: "18px 0" }} />

        {questions.map((qq, i) => {
          const a = s.getAnswer(grant.id, i).trim();
          return (
            <div key={i} style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>
                {i + 1}. {qq.q}
              </div>
              <p style={{ fontSize: 13.5, color: a ? C.body : C.faint, lineHeight: 1.65, marginTop: 7 }}>
                {a || "— not yet drafted —"}
              </p>
            </div>
          );
        })}

        {sources.length > 0 && (
          <>
            <div style={{ height: 1, background: "#edf0f4", margin: "8px 0 16px" }} />
            <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
              Sources drawn on
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from(new Set(sources)).map((src, i) => (
                <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>
                  <Check size={14} color={C.green} strokeWidth={2.4} style={{ marginTop: 2 }} /> {src}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
        <button
          onClick={() => s.go("flow", { grantId: grant.id, flowMode: mode })}
          style={{ background: "#fff", border: "1px solid #e2e6ec", color: C.body, borderRadius: 10, padding: "11px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
        >
          Keep editing
        </button>
        <button
          onClick={() => s.go("dashboard")}
          style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}
        >
          Done for now
        </button>
      </div>
    </div>
  );
}

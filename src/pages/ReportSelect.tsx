import { useStore } from "../state/store";
import { C, mono } from "../theme";
import { BackButton } from "../components/ui";
import { Report, ArrowRight } from "../components/icons";
import { currentOrg } from "../data";
import { GrantLifecycleStage } from "../../types/grantRecord";
import { grantVM } from "../lib/selectors";
import { relativeDue } from "../lib/format";

export function ReportSelect() {
  const s = useStore();
  const awarded = Array.from(currentOrg.grantRecords.values()).filter(
    (r) => s.stageOf(r.grant.id) === GrantLifecycleStage.Awarded,
  );

  return (
    <div style={{ maxWidth: 780, margin: "0 auto", padding: "34px 28px 90px", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
      <BackButton label="Dashboard" onClick={() => s.go("dashboard")} />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Report size={22} color={C.amber} />
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>Which report?</h1>
      </div>
      <p style={{ color: C.sub, fontSize: 14, marginTop: 7 }}>
        Pick an award to report on. We'll pull straight from what you tracked.
      </p>

      <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted, margin: "22px 0 12px" }}>
        Your awards · {awarded.length}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {awarded.map((r) => {
          const vm = grantVM(r.grant);
          return (
            <button
              key={r.id}
              onClick={() => s.go("flow", { grantId: r.grant.id, flowMode: "report" })}
              style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "18px 20px", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, boxShadow: "0 1px 2px rgba(16,21,31,.04)" }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 15.5 }}>{vm.name}</div>
                <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
                  {vm.funder} · {vm.amountLabel} · report due {relativeDue(r.grant.timeline.firstReportDeadline)}
                </div>
              </div>
              <ArrowRight size={18} color={C.indigo} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useMemo } from "react";
import { useStore } from "../state/store";
import { C, mono, fitBadgeStyle, fitLabel } from "../theme";
import { BackButton, SparkTag } from "../components/ui";
import { Search, Users } from "../components/icons";
import { grantsList } from "../data";
import { ISSUES, type Issue } from "../../types/constants";
import { REGIONS } from "../data/geo";
import { grantVM } from "../lib/selectors";
import { GrantLifecycleStage } from "../../types/grantRecord";

const ORG_TYPES = [
  { id: "fiscally-sponsored", label: "Fiscally-sponsored project", sub: "Sponsored by NSR" },
  { id: "nonprofit", label: "501(c)(3) nonprofit", sub: "Incorporated organization" },
  { id: "small-budget", label: "Under $500k budget", sub: "Smaller operating budgets" },
];

const LOCATIONS = [
  REGIONS.hazelwood.name,
  REGIONS.homewood.name,
  REGIONS.cityOfPittsburgh.name,
  REGIONS.alleghenyCounty.name,
];

const SORTS = ["Best fit", "Amount", "Deadline"];

export function Explore() {
  const s = useStore();

  const results = useMemo(() => {
    let list = grantsList.filter(
      (g) => s.stageOf(g.id) !== GrantLifecycleStage.Awarded,
    );
    if (s.exploreIssues.size > 0)
      list = list.filter((g) => g.issues.some((i) => s.exploreIssues.has(i)));
    if (s.locationFilters.size > 0)
      list = list.filter((g) => g.targetRegions.some((r) => s.locationFilters.has(r.name)));

    const vms = list.map(grantVM);
    if (s.sortBy === "Amount")
      vms.sort((a, b) => b.grant.award.totalAmount - a.grant.award.totalAmount);
    else if (s.sortBy === "Deadline")
      vms.sort(
        (a, b) =>
          a.grant.timeline.applicationWindowEnd.getTime() -
          b.grant.timeline.applicationWindowEnd.getTime(),
      );
    else vms.sort((a, b) => (b.display.fitScore ?? 100) - (a.display.fitScore ?? 100));
    return vms;
  }, [s.exploreIssues, s.locationFilters, s.sortBy, s.stages]);

  const strongCount = results.filter((v) => v.display.fitTier === "strong").length;
  const hasFilters = s.exploreIssues.size > 0 || s.locationFilters.size > 0;

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 28px 90px", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
      <BackButton label="Dashboard" onClick={() => s.go("dashboard")} />
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>
        Find a grant that fits your work
      </h1>
      <p style={{ color: C.sub, fontSize: 14.5, marginTop: 5, maxWidth: 640 }}>
        Results draw on what you told us and your living profile. Each result shows <em>why</em> it
        surfaced — and flags the ones that may not be worth your scarce time. You decide where to apply.
      </p>

      <div style={{ display: "flex", gap: 24, marginTop: 22, alignItems: "flex-start" }}>
        {/* filter panel */}
        <div
          style={{
            width: 290,
            flexShrink: 0,
            background: "#fff",
            border: `1px solid ${C.hairline}`,
            borderRadius: 18,
            padding: 22,
            position: "sticky",
            top: 88,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-.01em" }}>Refine your search</div>
            {hasFilters && (
              <button
                onClick={s.clearExploreFilters}
                style={{ background: "none", border: "none", color: C.red, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
              >
                Clear
              </button>
            )}
          </div>

          <PanelLabel>Issue tags</PanelLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ISSUES.map((i) => {
              const on = s.exploreIssues.has(i);
              return (
                <button
                  key={i}
                  onClick={() => s.toggleExploreIssue(i as Issue)}
                  style={{
                    border: on ? `1px solid ${C.indigo}` : "1px solid #e2e6ec",
                    background: on ? C.indigoSoft : "#fff",
                    color: on ? C.indigo : C.body,
                    borderRadius: 20,
                    padding: "6px 12px",
                    fontSize: 12,
                    fontWeight: on ? 700 : 600,
                    cursor: "pointer",
                  }}
                >
                  {i}
                </button>
              );
            })}
          </div>

          <PanelLabel>Organization type</PanelLabel>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 13, lineHeight: 1.4, marginTop: -6 }}>
            Show grants open to your kind of organization.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {ORG_TYPES.map((o) => (
              <CheckRow
                key={o.id}
                checked={s.orgTypeFilters.has(o.id)}
                onClick={() => s.toggleOrgType(o.id)}
                label={o.label}
                sub={o.sub}
              />
            ))}
          </div>

          <PanelLabel>Grant's target location</PanelLabel>
          <div style={{ fontSize: 12, color: C.muted, marginBottom: 13, lineHeight: 1.4, marginTop: -6 }}>
            Where the grant's funding must be spent.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
            {LOCATIONS.map((l) => (
              <CheckRow key={l} checked={s.locationFilters.has(l)} onClick={() => s.toggleLocation(l)} label={l} />
            ))}
          </div>
        </div>

        {/* results */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 240, position: "relative", display: "flex", alignItems: "center" }}>
              <Search size={17} color={C.faint} style={{ position: "absolute", left: 15 }} />
              <input
                defaultValue="fresh food access in Pittsburgh"
                style={{ width: "100%", border: "1px solid #e2e6ec", borderRadius: 12, padding: "12px 14px 12px 40px", fontSize: 14, outline: "none" }}
              />
            </div>
            <button style={{ background: C.ink, color: "#fff", border: "none", borderRadius: 12, padding: "12px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Search
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginTop: 18, flexWrap: "wrap" }}>
            <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>
              {results.length} opportunities
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12.5, color: C.muted }}>Sort by</span>
              {SORTS.map((o) => {
                const on = s.sortBy === o;
                return (
                  <button
                    key={o}
                    onClick={() => s.setSortBy(o)}
                    style={{
                      border: on ? `1px solid ${C.indigo}` : "1px solid #e2e6ec",
                      background: on ? C.indigoSoft : "#fff",
                      color: on ? C.indigo : C.sub,
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI disclosure strip */}
          <div style={{ marginTop: 16, background: C.indigoSoft, border: `1px solid ${C.indigoBorder}`, borderRadius: 14, padding: "14px 17px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <SparkTag>✦ AI-RANKED</SparkTag>
            <div style={{ fontSize: 13, color: "#3f4657", lineHeight: 1.55 }}>
              Ordered by fit — <strong style={{ color: C.ink }}>{strongCount} look like a strong fit</strong> for your
              service area and the programs in your profile.{" "}
              <span style={{ color: "#7c8598" }}>
                The fit score is AI's read of your profile — open any grant to see exactly why, traced to your
                records. It's a starting point, not a verdict.
              </span>
            </div>
          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 13 }}>
            {results.map((vm) => {
              const saved = s.isSaved(vm.id);
              const hasCollab = vm.grant.collabOpportunitySubscribers.length > 0;
              return (
                <div key={vm.id} style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 2px rgba(16,21,31,.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".05em", color: C.indigo, fontWeight: 600 }}>
                        {vm.funder}
                      </span>
                      <div style={{ fontWeight: 700, fontSize: 16.5, marginTop: 7 }}>{vm.name}</div>
                      <p style={{ fontSize: 13.5, color: C.sub, marginTop: 7, lineHeight: 1.5, maxWidth: 680 }}>
                        {vm.purpose}
                      </p>
                      <div style={{ display: "flex", gap: 18, marginTop: 13, flexWrap: "wrap" }}>
                        <Meta k="Amount" v={vm.amountLabel} />
                        <Meta k="Eligible area" v={vm.grant.targetRegions[0].name} />
                        <Meta k="Closes" v={vm.closesLabel} />
                        <Meta k="Issue" v={vm.issueLabel} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                      <div style={fitBadgeStyle(vm.display.fitTier)}>
                        {fitLabel(vm.display.fitTier, vm.display.fitScore)}
                      </div>
                      <button
                        onClick={() => {
                          if (saved) {
                            s.setModal({ kind: "unsave", grantId: vm.id });
                          } else {
                            s.saveGrant(vm.id);
                            s.setModal({ kind: "save", grantId: vm.id });
                          }
                        }}
                        style={
                          saved
                            ? { background: C.indigoSoft, color: C.indigo, border: `1px solid ${C.indigoBorder}`, borderRadius: 10, padding: "8px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }
                            : { background: "#fff", color: C.body, border: "1px solid #e2e6ec", borderRadius: 10, padding: "8px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }
                        }
                      >
                        {saved ? "✓ Saved" : "Save grant"}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16, paddingTop: 15, borderTop: `1px solid ${C.hairline3}` }}>
                    <button
                      onClick={() => s.go("grantDetail", { grantId: vm.id })}
                      style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      View details &amp; checklist
                    </button>
                    {hasCollab && (
                      <button
                        onClick={() => s.go("collab", { grantId: vm.id })}
                        style={{ background: "none", border: "none", color: C.sub, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <Users size={14} />
                        {vm.grant.collabOpportunitySubscribers.length} open to collaborate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, margin: "20px 0 11px" }}>
      {children}
    </div>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ fontSize: 12.5, color: C.body }}>
      <span style={{ color: C.faint }}>{k}</span> &nbsp;<strong>{v}</strong>
    </div>
  );
}

function CheckRow({
  checked,
  onClick,
  label,
  sub,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
}) {
  return (
    <div onClick={onClick} style={{ display: "flex", gap: 11, alignItems: sub ? "flex-start" : "center", cursor: "pointer" }}>
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 6,
          flexShrink: 0,
          marginTop: sub ? 1 : 0,
          border: checked ? "none" : "1.6px solid #cdd3dc",
          background: checked ? C.indigo : "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{label}</div>
        {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

import { useStore } from "../state/store";
import { C, mono, fitBadgeStyle, fitLabel } from "../theme";
import { BackButton, SparkTag } from "../components/ui";
import { Bulb, Check, Alert, Users, Share, External, ChevRight } from "../components/icons";
import { grantsList, currentOrg, networkOrgs, orgDisplay } from "../data";
import { grantVM } from "../lib/selectors";
import { shortDate } from "../lib/format";
import { GrantLifecycleStage } from "../../types/grantRecord";

export function GrantDetail() {
  const s = useStore();
  const grant = grantsList.find((g) => g.id === s.nav.grantId);
  if (!grant) return null;
  const vm = grantVM(grant);
  const record = currentOrg.grantRecords.get(grant.id);
  const saved = s.isSaved(grant.id);

  const strengths =
    record?.writingAnalyses[0]?.data
      .filter((d) => d.relevance)
      .map((d) => ({ text: d.relevance!, source: d.datum.citation })) ?? [];

  const gaps = grant.guidance.application.slice(0, 2).map((g) => ({
    text: g,
    source: `Guidance drawn from ${vm.funderShort}'s past listings`,
  }));

  const checklist = [
    ...grant.requirements.eligibility.map((c) => ({ label: c, source: "Eligibility · from the listing" })),
    ...grant.requirements.application.map((c) => ({ label: c, source: "Application · from the listing" })),
  ];

  const awardees = networkOrgs.filter((o) => {
    const r = o.grantRecords.get(grant.id);
    return r && r.stage === GrantLifecycleStage.Awarded;
  });

  const collaborators = grant.collabOpportunitySubscribers;

  const timeline = [
    { label: "Applications open", value: shortDate(grant.timeline.applicationWindowStart) },
    { label: "Deadline", value: shortDate(grant.timeline.applicationWindowEnd) },
    { label: "Decisions", value: shortDate(grant.timeline.notificationDate) },
    { label: "Award term", value: `${grant.timeline.awardTerm} months` },
  ];

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 28px 90px", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
      <BackButton label="Explore" onClick={() => s.go("explore")} />

      <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".05em", color: C.indigo, fontWeight: 600 }}>
            {vm.funder}
          </div>
          <h1 style={{ fontSize: 25, fontWeight: 800, letterSpacing: "-.02em", marginTop: 6 }}>{vm.name}</h1>
          <div style={{ display: "flex", gap: 8, marginTop: 11, flexWrap: "wrap" }}>
            <Pill>{vm.amountLabel}</Pill>
            <Pill>{grant.targetRegions[0].name}</Pill>
            <Pill>{vm.issueLabel}</Pill>
          </div>
        </div>
        <div style={{ display: "flex", gap: 9, flexShrink: 0, flexWrap: "wrap" }}>
          <a
            href={grant.link}
            target="_blank"
            rel="noopener"
            style={{ textDecoration: "none", background: "#fff", color: C.body, border: "1px solid #e2e6ec", borderRadius: 10, padding: "10px 15px", fontSize: 13, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 7 }}
          >
            Visit funder site <External size={13} />
          </a>
          <button
            onClick={() => s.setModal({ kind: "share", grantId: grant.id })}
            style={{ background: "#fff", color: C.body, border: "1px solid #e2e6ec", borderRadius: 10, padding: "10px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}
          >
            <Share size={14} /> Share
          </button>
          <button
            onClick={() => {
              if (saved) s.setModal({ kind: "unsave", grantId: grant.id });
              else {
                s.saveGrant(grant.id);
                s.setModal({ kind: "save", grantId: grant.id });
              }
            }}
            style={
              saved
                ? { background: C.indigoSoft, color: C.indigo, border: `1px solid ${C.indigoBorder}`, borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }
                : { background: C.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }
            }
          >
            {saved ? "✓ Saved" : "Save grant"}
          </button>
        </div>
      </div>

      {/* fit card */}
      <div style={{ background: "#fff", border: `1px solid ${C.indigoBorder}`, borderRadius: 16, padding: "20px 22px", marginTop: 18, display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Bulb size={24} color={C.indigo} style={{ marginTop: 1 }} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, fontSize: 15.5 }}>Why this could be a fit for you</div>
            <div style={fitBadgeStyle(vm.display.fitTier)}>{fitLabel(vm.display.fitTier, vm.display.fitScore)}</div>
          </div>
          <p style={{ fontSize: 13.5, color: C.body, lineHeight: 1.55, marginTop: 8 }}>
            {record?.alignmentAnalysis}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 13 }}>
            {strengths.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                <Check size={14} color={C.green} strokeWidth={2.6} style={{ marginTop: 2 }} />
                <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}>{r.text}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: C.faint, marginTop: 11 }}>
            You'll see the full, sourced analysis after adding any documents — this is just the headline.
          </div>
        </div>
      </div>

      {/* timeline */}
      <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: "18px 22px", marginTop: 20, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {timeline.map((t) => (
          <div key={t.label}>
            <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".06em", textTransform: "uppercase", color: C.faint }}>
              {t.label}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{t.value}</div>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 14.5, color: C.body, lineHeight: 1.6, marginTop: 18, maxWidth: 760 }}>{grant.purpose}</p>

      {/* AI strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 18, background: C.indigoSoft, border: `1px solid ${C.indigoBorder}`, borderRadius: 11, padding: "11px 15px" }}>
        <SparkTag>✦ AI</SparkTag>
        <span style={{ fontSize: 12.5, color: C.indigo700 }}>
          This checklist and fit read are drawn from {vm.funderShort}'s past requirements and your living profile — a
          starting point you control, not the official list.
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 18, marginTop: 18, alignItems: "start" }}>
        {/* checklist */}
        <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Check size={18} color={C.indigo} strokeWidth={2} />
            <div style={{ fontWeight: 700, fontSize: 15 }}>Requirement checklist</div>
          </div>
          <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 8, lineHeight: 1.5 }}>
            Built from this funder's past requirements — a starting point for <em>where to begin</em>, not the
            official list. Always check it against {vm.funderShort}'s own guidelines.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 14 }}>
            {checklist.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 11, padding: "12px 0", borderBottom: "1px solid #f3f5f7", alignItems: "flex-start" }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: "1.6px solid #cdd3dc", flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: C.ink }}>{c.label}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{c.source}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* evidence + awardees */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5 }}>How your work lines up</div>
            <p style={{ fontSize: 12, color: "#6b7280", marginTop: 6, lineHeight: 1.5 }}>
              Traced to your records and this funder's stated priorities. It's input for your call — not a yes/no.
            </p>

            <EvidenceLabel color={C.green}>Working in your favor</EvidenceLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {(strengths.length ? strengths : [{ text: "Your issue focus overlaps this grant's priorities.", source: "Your profile" }]).map((sX, i) => (
                <Evidence key={i} icon={<Check size={14} color={C.green} strokeWidth={2.6} style={{ marginTop: 2 }} />} text={sX.text} source={sX.source} />
              ))}
            </div>

            <EvidenceLabel color={C.amber}>Worth strengthening first</EvidenceLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              {gaps.map((g, i) => (
                <Evidence key={i} icon={<Alert size={14} color={C.amber} style={{ marginTop: 2 }} />} text={g.text} source={g.source} />
              ))}
            </div>
          </div>

          {awardees.length > 0 && (
            <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Recent awardees in the NSR network</div>
              <p style={{ fontSize: 12, color: "#6b7280", marginTop: 5, lineHeight: 1.5 }}>
                Organizations this funder has supported — useful for judging fit and finding collaborators.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 13 }}>
                {awardees.map((o) => {
                  const od = orgDisplay(o.id);
                  return (
                    <button
                      key={o.id}
                      onClick={() => s.go("orgProfile", { orgId: o.id, fromGrantId: grant.id })}
                      style={{ display: "flex", alignItems: "center", gap: 10, background: C.softBg, border: "1px solid #eef0f3", borderRadius: 10, padding: "9px 12px", cursor: "pointer", textAlign: "left", width: "100%" }}
                    >
                      <Avatar bg={od.avatar} initials={od.initials} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{od.name}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{od.serviceAreaLabel}</div>
                      </div>
                      <ChevRight size={15} color="#b3bbc7" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* collaborators */}
      {collaborators.length > 0 && (
        <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: 22, marginTop: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <Users size={18} color={C.indigo} />
            <div style={{ fontWeight: 700, fontSize: 15 }}>Organizations open to collaborating on this</div>
          </div>
          <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 8, lineHeight: 1.5, maxWidth: 680 }}>
            New Sun Rising members who opted in for this grant. Every introduction is one human reaching out to
            another — <strong style={{ color: C.ink }}>you write it, you send it, you decide.</strong>
          </p>
          <div style={{ marginTop: 14 }}>
            <button
              onClick={() => s.go("collab", { grantId: grant.id })}
              style={{ background: C.indigoSoft, color: C.indigo, border: `1px solid ${C.indigoBorder}`, borderRadius: 10, padding: "9px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              See the {collaborators.length} organizations →
            </button>
          </div>
        </div>
      )}

      {/* apply CTA */}
      <div style={{ marginTop: 26, background: "#fff", border: `1px solid ${C.indigoBorder}`, borderRadius: 16, padding: "20px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Ready to apply?</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>
            We'll help you gather your context and supporting data first — you choose what to share.
          </div>
        </div>
        <button
          onClick={() => {
            if (!saved) s.saveGrant(grant.id);
            s.setStage(grant.id, GrantLifecycleStage.Applied);
            s.go("flow", { grantId: grant.id, flowMode: "write" });
          }}
          style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 11, padding: "13px 26px", fontSize: 14.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Start Application →
        </button>
      </div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, background: "#f1f3f6", borderRadius: 20, padding: "3px 11px" }}>{children}</span>;
}

function EvidenceLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color, margin: "16px 0 9px" }}>
      {children}
    </div>
  );
}

function Evidence({ icon, text, source }: { icon: React.ReactNode; text: string; source: string }) {
  return (
    <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
      {icon}
      <div>
        <div style={{ fontSize: 13, color: C.body, lineHeight: 1.5 }}>{text}</div>
        <div style={{ fontSize: 11, color: C.faint, marginTop: 2 }}>↳ {source}</div>
      </div>
    </div>
  );
}

function Avatar({ bg, initials }: { bg: string; initials: string }) {
  return (
    <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

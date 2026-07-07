import { useState } from "react";
import { useStore } from "../state/store";
import { C, mono } from "../theme";
import { Bookmark, Award, Refresh, ChevDown, Edit } from "../components/icons";
import { currentOrg, GRANT_DISPLAY_BY_ID } from "../data";
import { GrantLifecycleStage } from "../../types/grantRecord";
import { grantVM } from "../lib/selectors";
import { relativeDue } from "../lib/format";

type Fact = { id: string; label: string; value: string; usedIn: string[]; updated: string };
type Cat = { id: string; label: string; sub: string; facts: Fact[] };

const CATEGORIES: Cat[] = [
  {
    id: "who",
    label: "Who we are & who we serve",
    sub: "Mission, community, and the need you address",
    facts: [
      {
        id: "f1",
        label: "Mission",
        value:
          "Riverside Greenway Project turns vacant riverfront land into shared green space and fresh food for Hazelwood residents.",
        usedIn: ["Heinz application", "Vibrancy report"],
        updated: "Jun 2026",
      },
      {
        id: "f2",
        label: "The need",
        value:
          "Only 41% of Hazelwood households live within a half-mile of fresh food, versus a 55% regional average.",
        usedIn: ["Heinz application"],
        updated: "May 2026",
      },
    ],
  },
  {
    id: "what",
    label: "What we do",
    sub: "Programs, activities, and reach",
    facts: [
      {
        id: "f3",
        label: "Programs",
        value: "Hazelwood Fresh Market, vacant-lot reclamation, and a youth grow crew.",
        usedIn: ["Grow Pittsburgh application"],
        updated: "Jun 2026",
      },
    ],
  },
  {
    id: "results",
    label: "What we've achieved",
    sub: "Outcomes funders ask you to show",
    facts: [
      {
        id: "f4",
        label: "Reach",
        value: "142 average weekly market visitors this spring, up from 84 at the start of the season.",
        usedIn: ["Vibrancy report"],
        updated: "Jun 2026",
      },
      {
        id: "f5",
        label: "Community ownership",
        value: "312 volunteer hours logged across the 2024–2025 growing season.",
        usedIn: ["Vibrancy report"],
        updated: "Jun 2026",
      },
    ],
  },
];

const DATA_TABS = ["Events", "Collaborators", "Impact"];

export function Profile() {
  const s = useStore();
  const records = Array.from(currentOrg.grantRecords.values());
  const [open, setOpen] = useState<string | null>("who");
  const [editing, setEditing] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [tab, setTab] = useState("Events");

  const saved = records.filter((r) => {
    const st = s.stageOf(r.grant.id);
    return st === GrantLifecycleStage.Saved || st === GrantLifecycleStage.Applied;
  });
  const awarded = records.filter((r) => s.stageOf(r.grant.id) === GrantLifecycleStage.Awarded);

  const dataEntries: Record<string, { title: string; meta: string }[]> = {
    Events: [
      { title: "Hazelwood Fresh Market — spring season", meta: "12 market days · avg 142 visitors" },
      { title: "Community harvest day", meta: "46 volunteers · June 2025" },
    ],
    Collaborators: currentOrg.sources
      .filter((x) => "link" in x)
      .map((x) => ({ title: (x as { link: string }).link, meta: "Linked source" })),
    Impact: [
      { title: "Volunteer Hours 2024-2025.csv", meta: "312 hours · uploaded" },
      { title: "Spring 2025 Market Sign-in Sheets.xlsx", meta: "Attendance · uploaded" },
    ],
  };

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "34px 28px 90px", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.02em" }}>Your living profile</h1>
          <p style={{ color: C.sub, fontSize: 14.5, marginTop: 6, maxWidth: 680 }}>
            Keep this current and writing &amp; reporting get faster every time. Write and Report pull straight from
            here — only ever surfacing what <em>you've</em> put in, with a link back to the source.
          </p>
        </div>
        <button
          onClick={() => {
            s.setOnboardStep(0);
            s.go("onboarding");
          }}
          style={{ background: "#fff", border: "1px solid #e2e6ec", color: C.sub, borderRadius: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7, flexShrink: 0 }}
        >
          <Refresh size={14} /> Replay welcome tour
        </button>
      </div>

      <SectionLabel>Your grants</SectionLabel>

      {/* saved */}
      <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: "18px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Bookmark size={18} color={C.indigo} />
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>Saved grants</div>
        </div>
        {saved.length ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
            {saved.map((r) => {
              const vm = grantVM(r.grant);
              const disc = s.isDiscoverable(r.grant.id);
              return (
                <div key={r.id} style={{ border: "1px solid #eef0f3", borderRadius: 12, padding: "14px 16px", background: "#fbfcfd", display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{vm.name}</div>
                    <div style={{ display: "flex", gap: 12, marginTop: 5, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11.5, color: C.muted }}>{vm.funder} · {vm.amountLabel}</span>
                      {disc && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: C.indigo, background: C.indigoSoft, borderRadius: 5, padding: "2px 7px" }}>
                          Discoverable
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <button onClick={() => s.go("grantDetail", { grantId: r.grant.id })} style={{ background: "#fff", border: "1px solid #e2e6ec", color: C.body, borderRadius: 9, padding: "7px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                      View
                    </button>
                    <button
                      onClick={() => (disc ? s.setDiscoverable(r.grant.id, false) : s.setModal({ kind: "disc", grantId: r.grant.id }))}
                      style={{ background: C.indigoSoft, border: `1px solid ${C.indigoBorder}`, color: C.indigo, borderRadius: 9, padding: "7px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      {disc ? "Stop listing" : "List me"}
                    </button>
                    <button onClick={() => s.setModal({ kind: "unsave", grantId: r.grant.id })} style={{ background: "none", border: "none", color: C.amber, borderRadius: 9, padding: "7px 11px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                      Unsave
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 11, lineHeight: 1.5 }}>
            You haven't saved any grants yet. Save them from{" "}
            <button onClick={() => s.go("explore")} style={{ background: "none", border: "none", color: C.indigo, fontWeight: 700, cursor: "pointer", fontSize: 13, textDecoration: "underline" }}>
              Explore
            </button>{" "}
            and manage them here.
          </p>
        )}
      </div>

      {/* awarded */}
      <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: "18px 20px", marginTop: 13 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Award size={18} color={C.green} />
          <div style={{ fontWeight: 700, fontSize: 14.5 }}>Awarded grants</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
          {awarded.map((r) => {
            const vm = grantVM(r.grant);
            return (
              <div key={r.id} style={{ border: "1px solid #eef0f3", borderRadius: 12, padding: "14px 16px", background: "#fbfcfd", display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{vm.name}</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 5 }}>
                    {vm.amountLabel} · Report due {relativeDue(r.grant.timeline.firstReportDeadline)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                  <button onClick={() => s.go("track", { grantId: r.grant.id })} style={{ background: "#fff", border: "1px solid #e2e6ec", color: C.body, borderRadius: 9, padding: "7px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                    Track impact
                  </button>
                  <button onClick={() => s.go("flow", { grantId: r.grant.id, flowMode: "report" })} style={{ background: C.indigo, border: "none", color: "#fff", borderRadius: 9, padding: "7px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                    Report
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* discoverable */}
      <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: "18px 20px", marginTop: 13 }}>
        <div style={{ fontWeight: 700, fontSize: 14.5 }}>Grants you're discoverable for</div>
        {Array.from(s.discoverable).length ? (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {Array.from(s.discoverable).map((id) => (
              <div key={id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: C.softBg, borderRadius: 10, padding: "10px 14px" }}>
                <div style={{ fontSize: 13, color: C.body }}>
                  Listed for <strong style={{ color: C.ink }}>{GRANT_DISPLAY_BY_ID[id]?.name ?? id}</strong>
                </div>
                <button onClick={() => s.setDiscoverable(id, false)} style={{ background: "none", border: "none", color: C.amber, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 13, color: "#6b7280", marginTop: 10, lineHeight: 1.5 }}>
            You're not listed anywhere yet. When you save a grant, you can opt in to let other NSR members find you —
            that's how warm introductions start.
          </p>
        )}
      </div>

      {/* narrative categories */}
      <SectionLabel>Your story, by the questions funders ask</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {CATEGORIES.map((c) => {
          const isOpen = open === c.id;
          return (
            <div key={c.id} style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, overflow: "hidden" }}>
              <button onClick={() => setOpen(isOpen ? null : c.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{c.label}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 1 }}>{c.sub}</div>
                </div>
                <div style={{ fontSize: 11.5, color: C.faint }}>{c.facts.length} facts</div>
                <ChevDown size={17} color="#b3bbc7" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
              </button>
              {isOpen && (
                <div style={{ padding: "0 20px 18px" }}>
                  {c.facts.map((f) => {
                    const isEd = editing === f.id;
                    return (
                      <div key={f.id} style={{ border: "1px solid #eef0f3", borderRadius: 12, padding: "14px 16px", marginTop: 10, background: "#fbfcfd" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>{f.label}</div>
                          {!isEd && (
                            <button onClick={() => { setEditing(f.id); setDrafts((d) => ({ ...d, [f.id]: f.value })); }} style={{ background: "none", border: "none", color: C.faint, cursor: "pointer", padding: 2 }}>
                              <Edit size={14} />
                            </button>
                          )}
                        </div>
                        {isEd ? (
                          <div style={{ marginTop: 8 }}>
                            <textarea
                              value={drafts[f.id] ?? f.value}
                              onChange={(e) => setDrafts((d) => ({ ...d, [f.id]: e.target.value }))}
                              style={{ width: "100%", border: `1px solid ${C.indigo}`, borderRadius: 9, padding: "9px 11px", fontSize: 13.5, lineHeight: 1.5, minHeight: 64, resize: "vertical", outline: "none" }}
                            />
                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                              <button onClick={() => { f.value = drafts[f.id] ?? f.value; setEditing(null); }} style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                                Save
                              </button>
                              <button onClick={() => setEditing(null)} style={{ background: "#f1f3f6", color: C.body, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ fontSize: 13.5, color: C.body, lineHeight: 1.55, marginTop: 6 }}>{f.value}</div>
                            <div style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 9, flexWrap: "wrap" }}>
                              {f.usedIn.map((u) => (
                                <span key={u} style={{ fontSize: 9.5, fontWeight: 700, color: C.indigo, background: C.indigoSoft, borderRadius: 5, padding: "2px 6px" }}>
                                  Used in {u}
                                </span>
                              ))}
                              <span style={{ fontSize: 11, color: "#b3bbc7", marginLeft: "auto" }}>Updated {f.updated}</span>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                  <button style={{ marginTop: 12, background: "none", border: "none", color: C.indigo, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                    + Add a fact to this section
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* structured data */}
      <SectionLabel>Your data — events, collaborators &amp; impact</SectionLabel>
      <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: "18px 20px" }}>
        <div style={{ display: "flex", gap: 7 }}>
          {DATA_TABS.map((t) => {
            const on = tab === t;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{ border: on ? `1px solid ${C.indigo}` : "1px solid #e2e6ec", background: on ? C.indigoSoft : "#fff", color: on ? C.indigo : C.sub, borderRadius: 8, padding: "6px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
              >
                {t}
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 11.5, color: C.faint, marginTop: 10 }}>
          Tired of typing? Drop in a spreadsheet, a PDF, or a photo of a paper sign-in sheet — we read it and you
          pick what to keep. Names and contact details are masked before anything is processed.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 14 }}>
          {(dataEntries[tab] ?? []).map((e, i) => (
            <div key={i} style={{ border: "1px solid #eef0f3", borderRadius: 12, padding: "13px 15px", background: "#fbfcfd" }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, wordBreak: "break-all" }}>{e.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>{e.meta}</div>
            </div>
          ))}
        </div>
        <button style={{ marginTop: 13, background: "#fff", border: "1px solid #e2e6ec", color: C.body, borderRadius: 9, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
          + Log a new entry manually
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted, margin: "26px 0 12px" }}>
      {children}
    </div>
  );
}

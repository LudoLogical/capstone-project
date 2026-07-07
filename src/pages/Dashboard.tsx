import { useStore } from "../state/store";
import { C, mono } from "../theme";
import { Eyebrow, Card, Bar } from "../components/ui";
import { Search, Chart } from "../components/icons";
import { currentOrg, orgDisplay, ORG_DISPLAY } from "../data";
import { GrantLifecycleStage } from "../../types/grantRecord";
import { grantVM } from "../lib/selectors";
import { questionsFor } from "../lib/flow";
import { money, monthYear, relativeDue } from "../lib/format";

export function Dashboard() {
  const s = useStore();
  const org = orgDisplay(currentOrg.id);
  const records = Array.from(currentOrg.grantRecords.values());

  const apps = records.filter((r) => s.stageOf(r.grant.id) === GrantLifecycleStage.Applied);
  const awarded = records.filter((r) => s.stageOf(r.grant.id) === GrantLifecycleStage.Awarded);

  const writeProgress = (grantId: string) => {
    const total = questionsFor(records.find((r) => r.grant.id === grantId)!.grant, "write").length;
    const filled = Object.values(s.answers[grantId] ?? {}).filter((v) => v.trim()).length;
    return { pct: Math.round((Math.max(filled, grantId.length % 3) / total) * 100), total };
  };

  const stories = Object.values(ORG_DISPLAY)
    .filter((o) => o.story)
    .map((o) => ({ ...o.story!, org: o.name, initials: o.initials, avatar: o.avatar }));

  const totalAward = awarded.reduce((n, r) => n + r.grant.award.totalAmount, 0);
  const spentTotal = awarded.reduce((n, r) => n + Math.round(r.grant.award.totalAmount * 0.55), 0);

  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "38px 28px 90px",
        animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)",
      }}
    >
      <div>
        <Eyebrow color={C.muted}>{org.tagline}</Eyebrow>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.02em", marginTop: 4 }}>
          Welcome back.
        </h1>
        <p style={{ color: C.sub, fontSize: 15, marginTop: 5, maxWidth: 560 }}>
          Find grants that fit, gather the evidence you already have, and reach the organizations
          around you — all in one place.
        </p>
      </div>

      {/* search hero */}
      <Card style={{ padding: 22, marginTop: 26, borderRadius: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 13 }}>
          Find the right grant opportunity
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 240, position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={17} color={C.faint} style={{ position: "absolute", left: 15 }} />
            <input
              onKeyDown={(e) => e.key === "Enter" && s.go("explore")}
              placeholder="Describe your work — e.g. fresh food access, youth arts, clean air…"
              style={{
                width: "100%",
                border: "1px solid #e2e6ec",
                borderRadius: 12,
                padding: "13px 14px 13px 40px",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
          <button
            onClick={() => s.go("explore")}
            style={{
              background: C.ink,
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "13px 20px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Find grants for us
          </button>
        </div>
      </Card>

      {/* applications you're writing */}
      <div style={{ marginTop: 26 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <Eyebrow>Applications you're writing · {apps.length}</Eyebrow>
          <button
            onClick={() => s.go("explore")}
            style={{ background: "none", border: "none", color: C.indigo, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
          >
            Find more grants →
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {apps.map((r) => {
            const vm = grantVM(r.grant);
            const prog = writeProgress(r.grant.id);
            return (
              <Card key={r.id} style={{ padding: "18px 20px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>{vm.name}</div>
                <div style={{ display: "flex", gap: 7, marginTop: 9, flexWrap: "wrap" }}>
                  <MiniTag>{vm.funderShort}</MiniTag>
                  <MiniTag>{vm.amountLabel}</MiniTag>
                </div>
                <div style={{ flex: 1, minHeight: 8 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 16 }}>
                  <Bar pct={prog.pct} />
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, whiteSpace: "nowrap" }}>
                    {prog.pct}% drafted
                  </span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 15 }}>
                  <button
                    onClick={() => s.go("flow", { grantId: r.grant.id, flowMode: "write" })}
                    style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "9px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    Continue writing
                  </button>
                  <button
                    onClick={() => s.go("grantDetail", { grantId: r.grant.id })}
                    style={{ background: "none", border: "none", color: C.sub, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                  >
                    Grant details
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* awarded — reports & budgets */}
      <div style={{ marginTop: 28 }}>
        <Eyebrow>Awarded — reports &amp; budgets · {awarded.length}</Eyebrow>
        <p style={{ fontSize: 12.5, color: C.muted, margin: "5px 0 14px" }}>
          Across your awards, <strong style={{ color: C.ink }}>{money(totalAward - spentTotal)} remaining</strong> of{" "}
          {money(totalAward)}.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {awarded.map((r) => {
            const vm = grantVM(r.grant);
            const track = s.tracking[r.grant.id];
            const included = track?.metrics.filter((m) => m.included) ?? [];
            const onTrack = included.filter((m) => m.current >= m.target).length;
            const reportPct = included.length ? Math.round((onTrack / included.length) * 100) : 0;
            const awardAmt = r.grant.award.totalAmount;
            const spent = Math.round(awardAmt * 0.55);
            const budgetPct = Math.round((spent / awardAmt) * 100);
            const due = r.grant.timeline.firstReportDeadline;
            return (
              <Card key={r.id} style={{ padding: 22, borderRadius: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{vm.name}</div>
                    <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>
                      {vm.funder} · {monthYear(r.grant.timeline.applicationWindowStart)} award
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.amber,
                      background: C.amberSoft,
                      border: `1px solid ${C.amberBorder}`,
                      borderRadius: 20,
                      padding: "4px 11px",
                    }}
                  >
                    Report due {relativeDue(due)}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
                  <div style={{ background: "#faf9ff", border: "1px solid #ece9fb", borderRadius: 12, padding: "14px 16px" }}>
                    <SubLabel color={C.purple}>Report</SubLabel>
                    <div style={{ display: "flex", alignItems: "center", gap: 11, marginTop: 10 }}>
                      <Bar pct={reportPct} color={C.purple} />
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, whiteSpace: "nowrap" }}>
                        {reportPct}%
                      </span>
                    </div>
                    <button
                      onClick={() => s.go("flow", { grantId: r.grant.id, flowMode: "report" })}
                      style={{ marginTop: 13, background: C.purple, color: "#fff", border: "none", borderRadius: 9, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                    >
                      Work on report
                    </button>
                  </div>
                  <div style={{ background: C.softBg, border: "1px solid #eef0f3", borderRadius: 12, padding: "14px 16px" }}>
                    <SubLabel color={C.indigo}>Budget remaining</SubLabel>
                    <div style={{ fontSize: 21, fontWeight: 800, marginTop: 5, letterSpacing: "-.01em" }}>
                      {money(awardAmt - spent)}
                    </div>
                    <div style={{ marginTop: 9 }}>
                      <Bar pct={budgetPct} />
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 7 }}>
                      {money(spent)} spent of {money(awardAmt)} · {budgetPct}%
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 16, borderTop: "1px solid #eef0f3", paddingTop: 15 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Chart size={15} color={C.green} />
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>Impact feeding this report</div>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.muted, margin: "3px 0 12px 23px" }}>
                    {onTrack} of {included.length} tracked measures already on track.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "11px 22px" }}>
                    {included.slice(0, 4).map((m) => {
                      const pct = Math.min(100, Math.round((m.current / m.target) * 100));
                      return (
                        <div key={m.id}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
                            <span style={{ color: C.body, fontWeight: 600 }}>{m.label}</span>
                            <span style={{ color: C.muted, whiteSpace: "nowrap" }}>
                              {m.current}/{m.target}
                            </span>
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <Bar pct={pct} color={pct >= 100 ? C.green : C.indigo} height={5} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => s.go("track", { grantId: r.grant.id })}
                    style={{ marginTop: 14, background: C.indigoSoft, color: C.indigo, border: `1px solid ${C.indigoBorder}`, borderRadius: 9, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Open impact tracking
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* success stories */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-.01em" }}>
            Success stories from our leaders
          </h2>
          <span style={{ fontSize: 12, color: C.muted }}>Scroll ›</span>
        </div>
        <div className="rail" style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 8 }}>
          {stories.map((st, i) => (
            <div
              key={i}
              style={{
                flex: "none",
                width: 262,
                background: "#fff",
                border: `1px solid ${C.hairline}`,
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 1px 2px rgba(16,21,31,.04)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  height: 120,
                  position: "relative",
                  background: `linear-gradient(135deg, ${st.avatar}, ${st.avatar}bb)`,
                }}
              >
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(16,21,31,0) 38%,rgba(16,21,31,.5))" }} />
                <div
                  style={{
                    position: "absolute",
                    left: 12,
                    bottom: 11,
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: "rgba(255,255,255,.94)",
                    color: C.ink,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {st.initials}
                </div>
              </div>
              <div style={{ padding: "15px 17px 17px" }}>
                <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.25 }}>{st.headline}</div>
                <p style={{ fontSize: 12.5, color: C.sub, marginTop: 7, lineHeight: 1.5 }}>{st.blurb}</p>
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 11, fontWeight: 600 }}>{st.org}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* network stats */}
      <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
        {[
          { value: "7", label: "NSR members near your work" },
          { value: money(totalAward), label: "Active award dollars you manage" },
          { value: "312", label: "Volunteer hours you've logged" },
        ].map((st) => (
          <div key={st.label} style={{ flex: 1, minWidth: 180, background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.01em" }}>{st.value}</div>
            <div style={{ fontSize: 12.5, color: "#6b7280", marginTop: 2 }}>{st.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniTag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 11.5, fontWeight: 600, color: C.sub, background: "#f1f3f6", borderRadius: 20, padding: "3px 10px" }}>
      {children}
    </span>
  );
}

function SubLabel({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color }}>
      {children}
    </div>
  );
}

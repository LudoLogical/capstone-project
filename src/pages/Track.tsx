import { useState } from "react";
import { useStore, type TrackMetric } from "../state/store";
import { C, mono } from "../theme";
import { BackButton, Bar } from "../components/ui";
import { Bulb, Chart, Chat, Plus, ArrowRight, Check } from "../components/icons";
import { grantsList } from "../data";
import { grantVM } from "../lib/selectors";

export function Track() {
  const s = useStore();
  const grant = grantsList.find((g) => g.id === s.nav.grantId) ?? grantsList[3];
  const vm = grantVM(grant);
  const plan = s.ensureTracking(grant.id);

  const commitment = `${grant.purpose} As an awardee you committed to: ${grant.requirements.awardee
    .slice(0, 2)
    .join("; ")}.`;

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 28px 90px", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
      <BackButton label="Dashboard" onClick={() => s.go("dashboard")} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".07em", fontWeight: 600, padding: "4px 9px", borderRadius: 6, color: "#047857", background: "#ecfdf5" }}>
          WORKING THE GRANT
        </span>
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>Track your impact</h1>
      </div>
      <p style={{ color: C.sub, fontSize: 14, marginTop: 7, maxWidth: 720 }}>
        {vm.name} — keep the evidence as you go, so reporting is gathering, not scrambling.
      </p>

      <div style={{ background: C.amberSoft, border: `1px solid ${C.amberBorder}`, borderRadius: 13, padding: "14px 17px", marginTop: 16 }}>
        <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: C.amber, marginBottom: 5 }}>
          What you committed to
        </div>
        <div style={{ fontSize: 13.5, color: C.ink, lineHeight: 1.5 }}>{commitment}</div>
      </div>

      {plan.accepted ? <Gathering grantId={grant.id} /> : <Planning grantId={grant.id} />}
    </div>
  );
}

function Planning({ grantId }: { grantId: string }) {
  const s = useStore();
  const plan = s.tracking[grantId];
  const included = plan.metrics.filter((m) => m.included).length;

  const toggle = (id: string) =>
    s.updateTracking(grantId, (t) => ({
      ...t,
      metrics: t.metrics.map((m) => (m.id === id ? { ...m, included: !m.included } : m)),
    }));

  return (
    <div style={{ marginTop: 22 }}>
      <div style={{ background: "#fff", border: `1px solid ${C.indigoBorder}`, borderRadius: 16, padding: "18px 20px", display: "flex", gap: 13, alignItems: "flex-start" }}>
        <Bulb size={22} color={C.indigo} style={{ marginTop: 1 }} />
        <div style={{ fontSize: 13.5, color: C.body, lineHeight: 1.55 }}>
          <strong style={{ color: C.ink }}>Here's what a strong report for this grant will likely ask you to show.</strong> We
          drew this from what you committed to and what this funder has asked past awardees — so you're not guessing
          which numbers matter. <span style={{ color: C.muted }}>Keep what fits, drop what doesn't.</span>
        </div>
      </div>

      <SectionLabel>Numbers worth tracking</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {plan.metrics.map((m) => (
          <div
            key={m.id}
            style={{
              background: "#fff",
              border: `1px solid ${m.included ? C.indigoBorder : C.hairline}`,
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
              <div
                onClick={() => toggle(m.id)}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 7,
                  flexShrink: 0,
                  marginTop: 1,
                  cursor: "pointer",
                  border: m.included ? "none" : "1.6px solid #cdd3dc",
                  background: m.included ? C.indigo : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {m.included && <Check size={13} color="#fff" strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap" }}>
                    Goal: <strong>{m.target}</strong> {m.unit}
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: C.sub, marginTop: 5, lineHeight: 1.5 }}>{m.why}</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 5 }}>↳ {m.source}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 22, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{included} measures selected · stories optional</div>
        <button
          onClick={() => s.updateTracking(grantId, (t) => ({ ...t, accepted: true }))}
          style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 11, padding: "12px 22px", fontSize: 14, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 9 }}
        >
          Accept plan &amp; start tracking <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Gathering({ grantId }: { grantId: string }) {
  const s = useStore();
  const plan = s.tracking[grantId];
  const [logId, setLogId] = useState<string | null>(null);
  const [logVal, setLogVal] = useState("");
  const [logNote, setLogNote] = useState("");
  const [addingStory, setAddingStory] = useState(false);
  const [storyText, setStoryText] = useState("");

  const included = plan.metrics.filter((m) => m.included);
  const onTrack = included.filter((m) => m.current >= m.target).length;
  const overall = included.length
    ? Math.round(
        (included.reduce((n, m) => n + Math.min(1, m.current / m.target), 0) / included.length) * 100,
      )
    : 0;

  const saveLog = (m: TrackMetric) => {
    const add = parseFloat(logVal) || 0;
    s.updateTracking(grantId, (t) => ({
      ...t,
      metrics: t.metrics.map((x) =>
        x.id === m.id
          ? {
              ...x,
              current: x.current + add,
              recent: [
                { text: `+${add} ${x.unit}${logNote ? " · " + logNote : ""}`, when: "just now" },
                ...x.recent,
              ].slice(0, 3),
            }
          : x,
      ),
    }));
    setLogId(null);
    setLogVal("");
    setLogNote("");
  };

  const saveStory = () => {
    if (!storyText.trim()) return setAddingStory(false);
    s.updateTracking(grantId, (t) => ({
      ...t,
      stories: [{ id: `s${t.stories.length + 1}`, text: storyText, when: "just now" }, ...t.stories],
    }));
    setStoryText("");
    setAddingStory(false);
  };

  return (
    <div style={{ marginTop: 20 }}>
      {/* status bar */}
      <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 16, padding: "18px 22px", display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap", boxShadow: "0 1px 2px rgba(16,21,31,.04)" }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {onTrack} of {included.length} measures on track
            </span>
            <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, color: C.indigo }}>{overall}%</span>
          </div>
          <div style={{ marginTop: 9 }}>
            <Bar pct={overall} height={7} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => s.updateTracking(grantId, (t) => ({ ...t, accepted: false }))}
            style={{ background: "#fff", border: "1px solid #e2e6ec", color: C.body, borderRadius: 10, padding: "9px 15px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Edit plan
          </button>
          <button
            onClick={() => s.go("flow", { grantId, flowMode: "report" })}
            style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}
          >
            Pull into report <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, background: C.softBg, border: "1px solid #eef0f3", borderRadius: 11, padding: "11px 16px", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12.5, color: "#6b7280" }}>
          Rather not type? Drop in a spreadsheet, a sign-in sheet, or a photo — we'll read the numbers and you confirm them.
        </span>
        <button style={{ background: C.indigoSoft, color: C.indigo, border: `1px solid ${C.indigoBorder}`, borderRadius: 9, padding: "7px 13px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
          Import records
        </button>
      </div>

      <SectionLabel>Your measures</SectionLabel>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {included.map((m) => {
          const pct = Math.min(100, Math.round((m.current / m.target) * 100));
          const status = m.current >= m.target ? { l: "On track", bg: "#ecfdf5", fg: "#047857" } : { l: "In progress", bg: "#fff7ed", fg: C.amber };
          return (
            <div key={m.id} style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 2px rgba(16,21,31,.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14.5 }}>{m.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: status.fg, background: status.bg, borderRadius: 20, padding: "3px 10px" }}>
                      {status.l}
                    </span>
                  </div>
                  <div style={{ fontSize: 11.5, color: C.faint, marginTop: 4 }}>↳ {m.source}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-.01em" }}>
                    {m.current}
                    <span style={{ color: C.faint, fontWeight: 600 }}>/{m.target}</span>
                  </div>
                  <div style={{ fontSize: 11, color: C.faint }}>{m.unit}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 13 }}>
                <Bar pct={pct} color={pct >= 100 ? C.green : C.indigo} height={7} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.sub, width: 36, textAlign: "right" }}>{pct}%</span>
              </div>

              {m.recent.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 13, paddingTop: 12, borderTop: "1px solid #f3f5f7" }}>
                  {m.recent.map((r, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, fontSize: 12 }}>
                      <span style={{ color: C.body }}>{r.text}</span>
                      <span style={{ color: "#b3bbc7", whiteSpace: "nowrap" }}>{r.when}</span>
                    </div>
                  ))}
                </div>
              )}

              {logId === m.id ? (
                <div style={{ marginTop: 14, background: C.softBg, border: "1px solid #e7eaef", borderRadius: 12, padding: 14, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 5 }}>Add {m.unit}</div>
                    <input
                      type="number"
                      value={logVal}
                      onChange={(e) => setLogVal(e.target.value)}
                      placeholder="0"
                      style={{ width: 110, border: "1px solid #e2e6ec", borderRadius: 9, padding: "9px 11px", fontSize: 14, outline: "none" }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 5 }}>Note (optional)</div>
                    <input
                      value={logNote}
                      onChange={(e) => setLogNote(e.target.value)}
                      placeholder="e.g. Saturday workshop"
                      style={{ width: "100%", border: "1px solid #e2e6ec", borderRadius: 9, padding: "9px 11px", fontSize: 13.5, outline: "none" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => saveLog(m)} style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 9, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      Save
                    </button>
                    <button onClick={() => setLogId(null)} style={{ background: "#f1f3f6", color: C.body, border: "none", borderRadius: 9, padding: "9px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setLogId(m.id);
                    setLogVal("");
                    setLogNote("");
                  }}
                  style={{ marginTop: 13, background: C.indigoSoft, color: C.indigo, border: "none", borderRadius: 9, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Plus size={13} /> Log progress
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* stories */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, margin: "26px 0 11px" }}>
        <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>
          Stories &amp; moments · {plan.stories.length} captured
        </div>
        {!addingStory && (
          <button onClick={() => setAddingStory(true)} style={{ background: "none", border: "none", color: C.indigo, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Plus size={13} /> Capture a story
          </button>
        )}
      </div>

      {addingStory && (
        <div style={{ background: "#fff", border: "1px solid #c7d2fe", borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
          <div style={{ fontWeight: 700, fontSize: 13.5 }}>What happened?</div>
          <textarea
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            placeholder="A participant, a partner, a moment that showed the work mattered — in your own words."
            style={{ width: "100%", marginTop: 9, border: "1px solid #e7eaef", borderRadius: 10, padding: "11px 13px", fontSize: 13.5, lineHeight: 1.6, minHeight: 84, resize: "vertical", outline: "none" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={saveStory} style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 9, padding: "8px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Save story
            </button>
            <button onClick={() => setAddingStory(false)} style={{ background: "#f1f3f6", color: C.body, border: "none", borderRadius: 9, padding: "8px 14px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {plan.stories.map((st) => (
          <div key={st.id} style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 12, padding: "14px 16px", display: "flex", gap: 11, alignItems: "flex-start" }}>
            <Chat size={16} color={C.indigo} style={{ marginTop: 2 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.body, lineHeight: 1.55 }}>{st.text}</div>
              <div style={{ fontSize: 11, color: "#b3bbc7", marginTop: 4 }}>{st.when}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, fontSize: 12, color: C.muted, display: "flex", gap: 7, alignItems: "center" }}>
        <Chart size={14} color={C.faint} /> Everything here flows straight into your report when you're ready.
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 11, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted, margin: "24px 0 11px" }}>
      {children}
    </div>
  );
}

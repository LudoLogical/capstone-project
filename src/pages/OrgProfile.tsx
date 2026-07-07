import { useStore } from "../state/store";
import { C, mono } from "../theme";
import { BackButton } from "../components/ui";
import { Link } from "../components/icons";
import { allInitiatives, orgDisplay, GRANT_DISPLAY_BY_ID } from "../data";
import { GrantLifecycleStage } from "../../types/grantRecord";

export function OrgProfile() {
  const s = useStore();
  const org = allInitiatives.find((o) => o.id === s.nav.orgId);
  if (!org) return null;
  const od = orgDisplay(org.id);

  const grantNames = Array.from(org.grantRecords.values())
    .filter((r) => r.stage === GrantLifecycleStage.Awarded)
    .map((r) => GRANT_DISPLAY_BY_ID[r.grant.id]?.name)
    .filter(Boolean) as string[];

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "34px 28px 90px", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
      <BackButton
        label={s.nav.fromGrantId ? "Back to grant" : "Back"}
        onClick={() => (s.nav.fromGrantId ? s.go("collab", { grantId: s.nav.fromGrantId }) : s.go("explore"))}
      />

      <div style={{ background: "#fff", border: `1px solid ${C.hairline}`, borderRadius: 18, overflow: "hidden", boxShadow: "0 1px 2px rgba(16,21,31,.04)" }}>
        <div style={{ height: 96, background: `linear-gradient(135deg, ${od.avatar}, ${od.avatar}aa)` }} />
        <div style={{ padding: "0 26px 26px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: -32 }}>
            <div style={{ width: 72, height: 72, borderRadius: 18, background: od.avatar, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 26, border: "4px solid #fff", flexShrink: 0 }}>
              {od.initials}
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em" }}>{od.name}</h1>
              <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>
                Serves {od.serviceAreaLabel} · NSR member since {od.nsrSince}
              </div>
            </div>
            <button
              onClick={() =>
                s.setModal({ kind: "email", orgId: org.id, grantId: s.nav.fromGrantId ?? "" })
              }
              style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}
            >
              Send intro
            </button>
          </div>

          <p style={{ fontSize: 14.5, color: C.body, lineHeight: 1.6, marginTop: 18 }}>{od.mission}</p>
          <p style={{ fontSize: 13.5, color: C.sub, lineHeight: 1.6, marginTop: 8 }}>{od.blurb}</p>

          {od.sharedConnection && (
            <div style={{ marginTop: 14, background: C.indigoSoft, border: `1px solid ${C.indigoBorder}`, borderRadius: 11, padding: "11px 14px", display: "flex", gap: 9, alignItems: "center" }}>
              <Link size={15} color={C.indigo} />
              <span style={{ fontSize: 12.5, color: C.indigo700 }}>{od.sharedConnection}</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
            <ProfileBlock label="Programs" items={od.programs} />
            <ProfileBlock label="Results" items={od.results} />
          </div>

          {grantNames.length > 0 && (
            <>
              <BlockLabel>Grants awarded</BlockLabel>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {grantNames.map((g) => (
                  <span key={g} style={{ fontSize: 12, fontWeight: 600, color: C.green, background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: 20, padding: "4px 12px" }}>
                    {g}
                  </span>
                ))}
              </div>
            </>
          )}

          <BlockLabel>Partners</BlockLabel>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {od.partners.map((p) => (
              <span key={p} style={{ fontSize: 12, fontWeight: 600, color: C.sub, background: "#f1f3f6", borderRadius: 20, padding: "4px 12px" }}>
                {p}
              </span>
            ))}
          </div>

          <div style={{ marginTop: 18, fontSize: 12, color: C.muted }}>
            Contact: <strong style={{ color: C.body }}>{org.contactEmail}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ border: "1px solid #eef0f3", borderRadius: 14, padding: "14px 16px", background: "#fbfcfd" }}>
      <div style={{ fontFamily: mono, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 9 }}>
        {items.map((it) => (
          <div key={it} style={{ fontSize: 13, color: C.body }}>
            • {it}
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: mono, fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: C.muted, margin: "20px 0 10px" }}>
      {children}
    </div>
  );
}

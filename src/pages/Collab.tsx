import { useStore } from "../state/store";
import { C } from "../theme";
import { BackButton } from "../components/ui";
import { Users, Link } from "../components/icons";
import { grantsList, orgDisplay } from "../data";
import { grantVM } from "../lib/selectors";

export function Collab() {
  const s = useStore();
  const grant = grantsList.find((g) => g.id === s.nav.grantId) ?? grantsList[0];
  const vm = grantVM(grant);
  const orgs = grant.collabOpportunitySubscribers;
  const disc = s.isDiscoverable(grant.id);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", padding: "34px 28px 90px", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
      <BackButton label="Grant details" onClick={() => s.go("grantDetail", { grantId: grant.id })} />

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Users size={22} color={C.indigo} />
        <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>Open to collaborating</h1>
      </div>
      <p style={{ color: C.sub, fontSize: 14, marginTop: 7, maxWidth: 720 }}>
        New Sun Rising members who opted in for <strong style={{ color: C.ink }}>{vm.name}</strong>. Ones you already
        share a connection with show first. Every introduction is one human reaching out to another —{" "}
        <strong style={{ color: C.ink }}>you write it, you send it, you decide.</strong>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
        {[...orgs]
          .sort((a, b) => (orgDisplay(b.id).sharedConnection ? 1 : 0) - (orgDisplay(a.id).sharedConnection ? 1 : 0))
          .map((o) => {
            const od = orgDisplay(o.id);
            return (
              <div key={o.id} style={{ border: "1px solid #eef0f3", borderRadius: 14, padding: 16, background: "#fbfcfd", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: od.avatar, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {od.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.25 }}>{od.name}</div>
                    <div style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Serves {od.serviceAreaLabel}</div>
                  </div>
                  {od.sharedConnection && (
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: C.indigo, background: C.indigoSoft, borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap", flexShrink: 0 }}>
                      Shared connection
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 12.5, color: C.sub, marginTop: 11, lineHeight: 1.5 }}>{od.blurb}</p>
                {od.sharedConnection && (
                  <div style={{ marginTop: 10, display: "flex", gap: 8, alignItems: "center", fontSize: 11.5, color: C.sub }}>
                    <Link size={13} color={C.indigo} /> {od.sharedConnection}
                  </div>
                )}
                <div style={{ flex: 1 }} />
                <div style={{ display: "flex", gap: 9, marginTop: 14 }}>
                  <button
                    onClick={() => s.go("orgProfile", { orgId: o.id, fromGrantId: grant.id })}
                    style={{ flex: 1, background: "#fff", color: C.body, border: "1px solid #e2e6ec", borderRadius: 9, padding: "8px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    View profile
                  </button>
                  <button
                    onClick={() => s.setModal({ kind: "email", orgId: o.id, grantId: grant.id })}
                    style={{ flex: 1, background: C.indigo, color: "#fff", border: "none", borderRadius: 9, padding: "8px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}
                  >
                    Send intro
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      <div style={{ marginTop: 16, background: disc ? C.indigoSoft : C.softBg, border: disc ? `1px solid ${C.indigoBorder}` : "1px dashed #d6cfc3", borderRadius: 11, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        {disc ? (
          <span style={{ fontSize: 12.5, color: C.indigo700 }}>
            ✓ Your organization is listed here too.{" "}
            <button onClick={() => s.go("profile")} style={{ background: "none", border: "none", color: C.indigo, fontWeight: 700, cursor: "pointer", fontSize: 12.5, textDecoration: "underline" }}>
              Manage in your profile
            </button>
          </span>
        ) : (
          <>
            <span style={{ fontSize: 12.5, color: C.sub }}>Working on this too? Let these organizations find you.</span>
            <button
              onClick={() => s.setModal({ kind: "disc", grantId: grant.id })}
              style={{ background: C.indigo, color: "#fff", border: "none", borderRadius: 9, padding: "8px 14px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
            >
              List us as open to collaborate
            </button>
          </>
        )}
      </div>
    </div>
  );
}

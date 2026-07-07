import { useStore, type Page } from "../state/store";
import { C } from "../theme";
import { Logo } from "./ui";
import { orgDisplay } from "../data";
import { currentOrg } from "../data";

const NAV: { label: string; page: Page }[] = [
  { label: "Dashboard", page: "dashboard" },
  { label: "Explore grants", page: "explore" },
  { label: "Profile", page: "profile" },
];

export function TopNav() {
  const s = useStore();
  const org = orgDisplay(currentOrg.id);

  const activeFor = (p: Page): boolean => {
    if (p === "explore")
      return ["explore", "grantDetail", "collab", "orgProfile"].includes(s.page);
    if (p === "dashboard")
      return ["dashboard", "flow", "brief", "track", "reportSelect", "collect"].includes(s.page);
    return s.page === p;
  };

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(255,255,255,.86)",
        backdropFilter: "saturate(1.4) blur(10px)",
        borderBottom: `1px solid ${C.hairline}`,
      }}
    >
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "13px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <div style={{ cursor: "pointer" }} onClick={() => s.go("dashboard")}>
          <Logo />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {NAV.map((n) => {
            const active = activeFor(n.page);
            return (
              <button
                key={n.page}
                onClick={() => s.go(n.page)}
                style={{
                  background: active ? C.indigoSoft : "none",
                  border: "none",
                  color: active ? C.indigo : C.sub,
                  borderRadius: 9,
                  padding: "8px 13px",
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 600,
                  cursor: "pointer",
                }}
              >
                {n.label}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => s.setModal({ kind: "aiInfo" })}
            title="How AI is used on this page"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: C.indigoSoft,
              border: `1px solid ${C.indigoBorder}`,
              color: C.indigo,
              borderRadius: 20,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            ✦ How AI is used on this page
          </button>
          <div
            title={org.name}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: C.indigoSoft,
              border: `1px solid ${C.indigoBorder}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 13,
              color: C.indigo,
            }}
          >
            {org.initials}
          </div>
        </div>
      </div>
    </div>
  );
}

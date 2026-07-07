import { useState } from "react";
import { useStore } from "../state/store";
import { C } from "../theme";
import { Check, Users, Sun } from "./icons";
import { GRANT_DISPLAY_BY_ID, orgDisplay } from "../data";
import { allInitiatives } from "../data";

function initiativeById(id: string) {
  return allInitiatives.find((o) => o.id === id);
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 80,
  background: "rgba(16,21,31,.42)",
  backdropFilter: "blur(2px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  animation: "overlayIn .18s ease",
};

function cardStyle(width = 480): React.CSSProperties {
  return {
    width,
    maxWidth: "100%",
    background: "#fff",
    borderRadius: 18,
    boxShadow: "0 24px 60px rgba(16,21,31,.28)",
    animation: "popIn .2s ease",
    maxHeight: "90vh",
    overflowY: "auto",
  };
}

const secondaryBtn: React.CSSProperties = {
  background: "#f1f3f6",
  color: C.body,
  border: "none",
  borderRadius: 10,
  padding: "11px 18px",
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
};
const primaryBtn: React.CSSProperties = {
  background: C.indigo,
  color: "#fff",
  border: "none",
  borderRadius: 10,
  padding: "11px 18px",
  fontSize: 13.5,
  fontWeight: 700,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

export function Modals() {
  const s = useStore();
  const m = s.modal;
  const [optSave, setOptSave] = useState(true);
  const [alsoDisc, setAlsoDisc] = useState(true);
  const [copied, setCopied] = useState(false);
  if (!m) return null;

  const close = () => s.setModal(null);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  let body: React.ReactNode = null;

  if (m.kind === "save") {
    const disp = GRANT_DISPLAY_BY_ID[m.grantId];
    body = (
      <div style={{ padding: "26px 28px" }}>
        <Header
          icon={<Check size={22} color={C.green} strokeWidth={2.4} />}
          iconBg={C.greenSoft}
          title="Saved to your grants"
          sub={disp.name}
        />
        <div style={{ height: 1, background: "#edf0f4", margin: "22px 0" }} />
        <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
          <Sun size={30} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>
              Let other NSR organizations find you here?
            </div>
            <p style={{ fontSize: 13.5, color: C.sub, marginTop: 6, lineHeight: 1.55 }}>
              Opt in and your organization joins the list of New Sun Rising members open to
              collaborating on <strong style={{ color: C.ink }}>{disp.name}</strong>. Others can see
              your profile and send you a warm introduction. You can remove yourself anytime — and a
              real person on your team always decides whether to reply.
            </p>
          </div>
        </div>
        <Actions>
          <button style={secondaryBtn} onClick={close}>
            Just save it
          </button>
          <button
            style={primaryBtn}
            onClick={() => {
              s.setDiscoverable(m.grantId, true);
              close();
            }}
          >
            <Users size={15} color="#fff" /> Yes, list us
          </button>
        </Actions>
      </div>
    );
  }

  if (m.kind === "unsave") {
    const disp = GRANT_DISPLAY_BY_ID[m.grantId];
    const wasDisc = s.isDiscoverable(m.grantId);
    body = (
      <div style={{ padding: "26px 28px" }}>
        <Header
          icon={<span style={{ fontSize: 20 }}>🔖</span>}
          iconBg="#fff7ed"
          title="Remove this saved grant?"
          sub={disp.name}
        />
        <p style={{ fontSize: 13.5, color: C.sub, marginTop: 16, lineHeight: 1.55 }}>
          It'll leave your saved grants. You can save it again anytime from Explore.
        </p>
        {wasDisc && (
          <div
            onClick={() => setAlsoDisc((v) => !v)}
            style={{
              display: "flex",
              gap: 11,
              alignItems: "flex-start",
              marginTop: 16,
              background: C.softBg,
              border: "1px solid #edf0f4",
              borderRadius: 11,
              padding: "13px 15px",
              cursor: "pointer",
            }}
          >
            <CheckBox on={alsoDisc} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                Also remove me from being discoverable
              </div>
              <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 3, lineHeight: 1.5 }}>
                You're listed so other NSR members can find you for this grant. Leave this unchecked
                to stay discoverable even after unsaving.
              </p>
            </div>
          </div>
        )}
        <Actions>
          <button style={secondaryBtn} onClick={close}>
            Keep it saved
          </button>
          <button
            style={{ ...primaryBtn, background: C.amber }}
            onClick={() => {
              s.unsaveGrant(m.grantId, wasDisc && alsoDisc);
              close();
            }}
          >
            Unsave
          </button>
        </Actions>
      </div>
    );
  }

  if (m.kind === "disc") {
    const disp = GRANT_DISPLAY_BY_ID[m.grantId];
    const already = s.isSaved(m.grantId);
    body = (
      <div style={{ padding: "26px 28px" }}>
        <Header
          icon={<Users size={22} color={C.indigo} />}
          iconBg={C.indigoSoft}
          title="List your org as open to collaborate?"
          sub={disp.name}
        />
        <p style={{ fontSize: 13.5, color: C.sub, marginTop: 16, lineHeight: 1.55 }}>
          Other New Sun Rising members working on this grant will be able to find you and reach out.
          You can stop listing anytime from your profile.
        </p>
        {!already && (
          <div
            onClick={() => setOptSave((v) => !v)}
            style={{
              display: "flex",
              gap: 11,
              alignItems: "flex-start",
              marginTop: 16,
              background: C.softBg,
              border: "1px solid #edf0f4",
              borderRadius: 11,
              padding: "13px 15px",
              cursor: "pointer",
            }}
          >
            <CheckBox on={optSave} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 13.5 }}>
                Also save this grant to your dashboard
              </div>
              <p style={{ fontSize: 12.5, color: "#6b7280", marginTop: 3, lineHeight: 1.5 }}>
                Keeps it in your saved grants so you can pick the application back up easily.
              </p>
            </div>
          </div>
        )}
        <Actions>
          <button style={secondaryBtn} onClick={close}>
            Cancel
          </button>
          <button
            style={{ ...primaryBtn, display: "inline-block" }}
            onClick={() => {
              s.setDiscoverable(m.grantId, true);
              if (!already && optSave) s.saveGrant(m.grantId);
              close();
            }}
          >
            Save
          </button>
        </Actions>
      </div>
    );
  }

  if (m.kind === "aiInfo") {
    body = (
      <div style={{ padding: "26px 28px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: C.indigoSoft,
            border: `1px solid ${C.indigoBorder}`,
            color: C.indigo,
            fontSize: 10.5,
            fontWeight: 800,
            letterSpacing: ".05em",
            padding: "4px 10px",
            borderRadius: 20,
          }}
        >
          ✦ AI TRANSPARENCY
        </div>
        <div style={{ fontWeight: 800, fontSize: 18, marginTop: 12 }}>
          How AI is used in the Vibrancy Portal
        </div>
        <Label>What the AI does here</Label>
        <List
          items={[
            "Ranks grants by fit using only your profile and the funder's past requirements.",
            "Drafts a starting checklist and highlights where your work is strong or thin.",
            "Prefills writing and reporting answers from data you supplied — always editable.",
          ]}
          color={C.indigo}
        />
        <Label>Where the information comes from</Label>
        <List
          items={[
            "The Vibrancy Index dataset and NSR services you already use.",
            "Documents, links, and notes you add to your living profile.",
          ]}
          color={C.cyan}
        />
        <div
          style={{
            background: C.softBg,
            border: "1px solid #eef0f3",
            borderRadius: 12,
            padding: "13px 15px",
            marginTop: 18,
            fontSize: 12.5,
            color: C.sub,
            lineHeight: 1.55,
          }}
        >
          Nothing you type is sent anywhere without you choosing to. Every AI suggestion is traced
          to a source you can open, and a person on your team always makes the final call.
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button style={{ ...primaryBtn, padding: "11px 20px" }} onClick={close}>
            Got it
          </button>
        </div>
      </div>
    );
  }

  if (m.kind === "share") {
    const disp = GRANT_DISPLAY_BY_ID[m.grantId];
    const linkUrl = `https://portal.newsunrising.org/grants/${m.grantId}`;
    body = (
      <div style={{ padding: "26px 28px" }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Share this grant</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{disp.name}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
          {[
            { l: "Facebook", bg: "#1877f2", t: "f" },
            { l: "X / Twitter", bg: "#10151f", t: "X" },
            { l: "LinkedIn", bg: "#0a66c2", t: "in" },
            { l: "Email", bg: C.indigo, t: "✉" },
          ].map((x) => (
            <div
              key={x.l}
              style={{
                flex: 1,
                minWidth: 80,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 7,
                background: C.softBg,
                border: "1px solid #eef0f3",
                borderRadius: 12,
                padding: "15px 8px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 9,
                  background: x.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 15,
                }}
              >
                {x.t}
              </div>
              <span style={{ fontSize: 11.5, color: C.sub, fontWeight: 600 }}>{x.l}</span>
            </div>
          ))}
        </div>
        <Label>Or copy link</Label>
        <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <div
            style={{
              flex: 1,
              background: C.softBg,
              border: "1px solid #e2e6ec",
              borderRadius: 10,
              padding: "11px 13px",
              fontSize: 12.5,
              color: C.sub,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {linkUrl}
          </div>
          <button
            style={{ ...primaryBtn, padding: "11px 16px", whiteSpace: "nowrap" }}
            onClick={() => {
              navigator.clipboard?.writeText(linkUrl).catch(() => {});
              setCopied(true);
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <Actions>
          <button style={secondaryBtn} onClick={close}>
            Done
          </button>
        </Actions>
      </div>
    );
  }

  if (m.kind === "email") {
    const org = orgDisplay(m.orgId);
    const email = initiativeById(m.orgId)?.contactEmail ?? "";
    const disp = GRANT_DISPLAY_BY_ID[m.grantId];
    const subject = `Collaborating on ${disp.name}?`;
    const bodyText = `Hi ${org.name} team,\n\nI'm with Riverside Greenway Project — we're both looking at the ${disp.name}. Would you be open to a quick call about applying together or sharing notes?\n\nWarmly,\nRiverside Greenway Project`;
    body = (
      <div style={{ padding: "26px 28px" }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>Send a warm introduction</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
          To {org.name} · {email}
        </div>
        <Label>Subject</Label>
        <input
          defaultValue={subject}
          style={{
            width: "100%",
            border: "1px solid #e2e6ec",
            borderRadius: 10,
            padding: "11px 13px",
            fontSize: 13.5,
            outline: "none",
          }}
        />
        <Label>Message</Label>
        <textarea
          defaultValue={bodyText}
          style={{
            width: "100%",
            border: "1px solid #e2e6ec",
            borderRadius: 10,
            padding: "11px 13px",
            fontSize: 13.5,
            lineHeight: 1.6,
            minHeight: 150,
            resize: "vertical",
            outline: "none",
          }}
        />
        <p style={{ fontSize: 11.5, color: C.faint, marginTop: 10, lineHeight: 1.5 }}>
          You send this yourself — nothing goes out until you hit send in your own email. This just
          drafts it for you.
        </p>
        <Actions>
          <button style={secondaryBtn} onClick={close}>
            Cancel
          </button>
          <button style={{ ...primaryBtn, display: "inline-block" }} onClick={close}>
            Open in email
          </button>
        </Actions>
      </div>
    );
  }

  if (m.kind === "sourceInfo") {
    body = (
      <div style={{ padding: "26px 28px" }}>
        <div style={{ fontWeight: 800, fontSize: 17 }}>{m.title}</div>
        <Label>Value in context</Label>
        <p style={{ fontSize: 13.5, color: C.body, lineHeight: 1.6 }}>{m.detail}</p>
        <Label>Where this comes from</Label>
        <div
          style={{
            background: C.softBg,
            border: "1px solid #eef0f3",
            borderRadius: 12,
            padding: "13px 15px",
            fontSize: 12.5,
            color: C.sub,
            lineHeight: 1.55,
          }}
        >
          ↳ {m.origin}
        </div>
        <Actions>
          <button style={{ ...primaryBtn, display: "inline-block" }} onClick={close}>
            Got it
          </button>
        </Actions>
      </div>
    );
  }

  const width = m.kind === "email" ? 560 : m.kind === "aiInfo" ? 520 : 480;

  return (
    <div style={overlay} onClick={close}>
      <div style={cardStyle(width)} onClick={stop}>
        {body}
      </div>
    </div>
  );
}

function Header({
  icon,
  iconBg,
  title,
  sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  sub: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#6b7280" }}>{sub}</div>
      </div>
    </div>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
      {children}
    </div>
  );
}

function CheckBox({ on }: { on: boolean }) {
  return (
    <div
      style={{
        width: 20,
        height: 20,
        borderRadius: 6,
        flexShrink: 0,
        marginTop: 1,
        border: on ? "none" : "1.6px solid #cdd3dc",
        background: on ? C.indigo : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {on && <Check size={13} color="#fff" strokeWidth={3} />}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: ".05em",
        color: C.faint,
        margin: "18px 0 9px",
      }}
    >
      {children}
    </div>
  );
}

function List({ items, color }: { items: string[]; color: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((u, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 9,
            alignItems: "flex-start",
            fontSize: 13.5,
            color: C.body,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color, fontWeight: 800, marginTop: 1 }}>→</span>
          {u}
        </div>
      ))}
    </div>
  );
}

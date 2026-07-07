import { useStore } from "../state/store";
import { C, mono } from "../theme";
import { Logo } from "../components/ui";
import { Search, Chart, Users, ArrowRight, ArrowLeft, Check } from "../components/icons";
import { ISSUES, type Issue } from "../../types/constants";
import { REGIONS } from "../data/geo";
import { grantsList } from "../data";

const AREAS = [
  REGIONS.hazelwood.name,
  REGIONS.homewood.name,
  REGIONS.lawrenceville.name,
  REGIONS.northside.name,
  REGIONS.braddock.name,
  REGIONS.hilltop.name,
  REGIONS.cityOfPittsburgh.name,
  REGIONS.alleghenyCounty.name,
];

export function Onboarding() {
  const s = useStore();
  const step = s.onboardStep;

  const matchCount = grantsList.filter((g) =>
    g.issues.some((i) => s.onboardIssues.has(i)),
  ).length;
  const hasMatch = s.onboardIssues.size > 0 && matchCount > 0;
  const orgLabel = s.orgName.trim() || "your organization";
  const areaLabel =
    s.onboardAreas.size > 0 ? Array.from(s.onboardAreas)[0] : "your service area";

  const next = () => {
    if (step >= 2) s.go("dashboard");
    else s.setOnboardStep(step + 1);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(120% 90% at 50% -10%, #eef2ff 0%, #f4f5f7 55%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <div style={{ width: 580, maxWidth: "100%", animation: "fadeSlide .4s cubic-bezier(.16,1,.3,1)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 22,
          }}
        >
          <Logo compact />
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 22 : 7,
                  height: 7,
                  borderRadius: 7,
                  background: i <= step ? C.indigo : "#d7dbe3",
                  transition: "all .3s",
                }}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            border: `1px solid ${C.hairline}`,
            borderRadius: 20,
            padding: "34px 36px",
            boxShadow: "0 8px 30px rgba(16,21,31,.07)",
          }}
        >
          {step === 0 && (
            <div style={{ animation: "popIn .3s ease" }}>
              <Eyebrow>Welcome</Eyebrow>
              <h1 style={{ fontSize: 27, fontWeight: 800, letterSpacing: "-.02em", lineHeight: 1.2 }}>
                Grant support that keeps
                <br />
                the relationships human.
              </h1>
              <p style={{ color: C.sub, fontSize: 15, marginTop: 13, lineHeight: 1.6 }}>
                Finding the right grants, doing the math, remembering what you did all year —
                especially the first time, it's overwhelming. Tell us a little about your work and the
                Portal does the searching, the tracking, and the remembering, so you can stay in your
                own words.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 24 }}>
                <Feature
                  icon={<Search size={17} color={C.indigo} />}
                  title="Find grants that actually fit"
                  sub="We surface why each one matches — and flag the long shots."
                />
                <Feature
                  icon={<Chart size={17} color={C.indigo} />}
                  title="Keep the right numbers, all year"
                  sub="So reporting writes itself instead of starting from scratch."
                />
                <Feature
                  icon={<Users size={17} color={C.indigo} />}
                  title="Reach the orgs around you"
                  sub="Warm introductions to fellow members — you always send them."
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div style={{ animation: "popIn .3s ease" }}>
              <Eyebrow>About your work · 1 of 2</Eyebrow>
              <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>
                Tell us about your organization
              </h1>
              <p style={{ color: C.sub, fontSize: 14, marginTop: 7, lineHeight: 1.55 }}>
                Just the basics — you can change any of this later. It's what lets us find grants
                that fit.
              </p>

              <div style={{ marginTop: 22 }}>
                <FieldLabel>Organization name</FieldLabel>
                <input
                  value={s.orgName}
                  onChange={(e) => s.setOrgName(e.target.value)}
                  placeholder="e.g. Riverside Greenway Project"
                  style={{
                    width: "100%",
                    border: "1px solid #e2e6ec",
                    borderRadius: 11,
                    padding: "12px 14px",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <FieldLabel>
                  What issues do you work on?{" "}
                  <span style={{ color: C.faint, fontWeight: 500 }}>— pick all that apply</span>
                </FieldLabel>
                <ChipRow
                  items={ISSUES}
                  selected={s.onboardIssues}
                  onToggle={(i) => s.toggleOnboardIssue(i as Issue)}
                />
              </div>

              <div style={{ marginTop: 18 }}>
                <FieldLabel>
                  Where do you serve?{" "}
                  <span style={{ color: C.faint, fontWeight: 500 }}>— pick all that apply</span>
                </FieldLabel>
                <ChipRow
                  items={AREAS}
                  selected={s.onboardAreas}
                  onToggle={(a) => s.toggleOnboardArea(a)}
                />
              </div>

              {hasMatch && (
                <div
                  style={{
                    marginTop: 22,
                    background: C.amberSoft,
                    border: `1px solid ${C.amberBorder}`,
                    borderRadius: 12,
                    padding: "13px 16px",
                    display: "flex",
                    gap: 11,
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 20 }}>✦</span>
                  <div style={{ fontSize: 13, color: "#92400e", lineHeight: 1.5 }}>
                    <strong style={{ color: C.ink }}>
                      {matchCount} grants in the New Sun Rising network
                    </strong>{" "}
                    already look relevant to your work — we'll have them ready on the other side.
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ animation: "popIn .3s ease", textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: C.greenSoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Check size={30} color={C.green} strokeWidth={2.6} />
              </div>
              <h1 style={{ fontSize: 23, fontWeight: 800, letterSpacing: "-.02em" }}>
                You're all set, {orgLabel}.
              </h1>
              <p
                style={{
                  color: C.sub,
                  fontSize: 14,
                  marginTop: 8,
                  lineHeight: 1.55,
                  maxWidth: 420,
                  margin: "8px auto 0",
                }}
              >
                Here's what we've got ready for you. Everything stays editable in your profile.
              </p>
              <div
                style={{
                  textAlign: "left",
                  background: C.softBg,
                  border: "1px solid #eef0f3",
                  borderRadius: 14,
                  padding: "6px 18px",
                  marginTop: 20,
                }}
              >
                <SummaryRow>
                  Profile started for <strong style={{ color: C.ink }}>{orgLabel}</strong> ·{" "}
                  {areaLabel}
                </SummaryRow>
                <SummaryRow>
                  <strong style={{ color: C.ink }}>
                    {Math.max(matchCount, 5)} matching grants
                  </strong>{" "}
                  waiting in Explore
                </SummaryRow>
                <SummaryRow last>
                  Impact tracking ready to connect to your grant reports
                </SummaryRow>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 14,
              marginTop: 30,
            }}
          >
            {step === 0 ? (
              <button
                onClick={() => s.go("dashboard")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8a93a3",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Skip setup
              </button>
            ) : (
              <button
                onClick={() => s.setOnboardStep(step - 1)}
                style={{
                  background: "none",
                  border: "none",
                  color: C.sub,
                  fontSize: 13.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button
              onClick={next}
              style={{
                background: C.indigo,
                color: "#fff",
                border: "none",
                borderRadius: 11,
                padding: "13px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
              }}
            >
              {step === 0 ? "Get started" : step === 1 ? "See my matches" : "Go to my dashboard"}
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: 11,
        letterSpacing: ".12em",
        textTransform: "uppercase",
        color: C.indigo,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 9 }}>{children}</div>
  );
}

function Feature({
  icon,
  title,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <div style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: C.indigoSoft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 14 }}>{title}</div>
        <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function ChipRow({
  items,
  selected,
  onToggle,
}: {
  items: readonly string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {items.map((label) => {
        const on = selected.has(label);
        return (
          <button
            key={label}
            onClick={() => onToggle(label)}
            style={{
              border: on ? `1px solid ${C.indigo}` : "1px solid #e2e6ec",
              background: on ? C.indigoSoft : "#fff",
              color: on ? C.indigo : C.body,
              borderRadius: 20,
              padding: "8px 14px",
              fontSize: 13,
              fontWeight: on ? 700 : 600,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function SummaryRow({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        padding: "13px 0",
        borderBottom: last ? "none" : "1px solid #edf0f4",
      }}
    >
      <Check size={17} color={C.green} strokeWidth={2.4} />
      <div style={{ fontSize: 13.5, color: C.body }}>{children}</div>
    </div>
  );
}

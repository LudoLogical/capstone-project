import Modal from "./Modal";
import { useAppStore } from "@/store/useAppStore";

export default function PrivacyModal() {
  const signedIn = useAppStore((s) => s.signedIn);
  const privacyAcked = useAppStore((s) => s.privacyAcked);
  const ackPrivacy = useAppStore((s) => s.ackPrivacy);

  return (
    <Modal open={signedIn && !privacyAcked} onClose={ackPrivacy} title="Before you get started" maxWidth={460}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {[
          "Your data is never used to train our AI.",
          "Your data is never shared or sold without your explicit consent.",
          "You choose what the AI reads, one item at a time.",
        ].map((line) => (
          <div key={line} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ color: "var(--color-success-ink)", fontWeight: 700 }}>✓</span>
            <span style={{ fontSize: 14.5, lineHeight: 1.5 }}>{line}</span>
          </div>
        ))}
      </div>
      <button onClick={ackPrivacy} className="btn btn-primary btn-block">
        Got it — enter the portal
      </button>
    </Modal>
  );
}

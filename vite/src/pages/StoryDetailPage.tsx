import { useNavigate, useParams } from "react-router-dom";
import { STORIES } from "@/data/seed";

export default function StoryDetailPage() {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const story = STORIES.find((s) => s.id === storyId);

  if (!story) {
    return (
      <div className="page-narrow page-enter">
        <p>Story not found.</p>
        <button onClick={() => navigate("/")} className="back-link">
          ← Back to stories
        </button>
      </div>
    );
  }

  return (
    <div className="page-narrow page-enter">
      <button onClick={() => navigate("/")} className="back-link">
        ← Back to stories
      </button>
      <div className="card" style={{ padding: 32 }}>
        <div className="pill pill-accent" style={{ marginBottom: 14 }}>
          {story.tag}
        </div>
        <h1 className="h1-serif" style={{ fontSize: 30, marginBottom: 6 }}>
          {story.who}
        </h1>
        <div style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 20 }}>
          {story.org} · {story.grant}
        </div>
        <div style={{ borderLeft: "3px solid var(--color-accent)", padding: "6px 0 6px 18px", marginBottom: 24 }}>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontSize: 19,
              lineHeight: 1.5,
              color: "var(--color-text-body)",
              marginBottom: 8,
            }}
          >
            “{story.quote}”
          </p>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-muted)" }}>{story.person}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {story.body.map((para, i) => (
            <p key={i} style={{ fontSize: 16, lineHeight: 1.65, color: "var(--color-text-body)" }}>
              {para}
            </p>
          ))}
        </div>
        <div
          style={{
            marginTop: 28,
            paddingTop: 24,
            borderTop: "1px solid var(--color-divider-2)",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => navigate("/search")} className="btn btn-primary">
            Start your own →
          </button>
          <button onClick={() => navigate("/")} className="btn btn-secondary">
            Back to stories
          </button>
        </div>
      </div>
    </div>
  );
}

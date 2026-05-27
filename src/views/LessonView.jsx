import { theme } from "../theme.js";
import { COURSE } from "../data/index.js";
import { HeaderBar } from "../components/HeaderBar.jsx";
import { ContentRenderer } from "../components/ContentRenderer.jsx";

export function LessonView({ mod, lesson, completed, onToggle, onMarkDone, onGo, contentRef }) {
  const flat = COURSE.modules.flatMap((m) => m.lessons.map((l) => ({ mod: m, lesson: l })));
  const idx = flat.findIndex((x) => x.lesson.id === lesson.id);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx < flat.length - 1 ? flat[idx + 1] : null;
  const done = completed.has(lesson.id);

  return (
    <div
      ref={contentRef}
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.font.serif,
      }}
    >
      <HeaderBar
        backLabel="BACK"
        onBack={() => onGo("module", mod)}
        accent={mod.accent}
        right={
          <button
            onClick={() => onToggle(lesson.id)}
            style={{
              background: done ? mod.accent : "transparent",
              border: `1px solid ${mod.accent}`,
              color: done ? theme.bg : mod.accent,
              padding: "5px 14px",
              borderRadius: theme.radius.md,
              cursor: "pointer",
              fontFamily: theme.font.mono,
              fontSize: 11,
              letterSpacing: 1,
              fontWeight: 600,
            }}
          >
            {done ? "✓ DONE" : "MARK DONE"}
          </button>
        }
      />
      <div style={{ maxWidth: theme.maxWidth.content, margin: "0 auto", padding: "48px 20px 40px" }}>
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 11,
            letterSpacing: 3,
            color: mod.accent,
            marginBottom: 10,
            textTransform: "uppercase",
          }}
        >
          Module {mod.number} · {lesson.duration}
        </div>
        <h1
          style={{
            fontSize: "clamp(26px,5vw,38px)",
            fontWeight: 400,
            lineHeight: 1.2,
            margin: "0 0 6px",
            color: theme.textStrong,
          }}
        >
          {lesson.title}
        </h1>
        <div style={{ display: "flex", gap: 6, marginBottom: 40, flexWrap: "wrap" }}>
          {lesson.tags.map((t) => (
            <span
              key={t}
              style={{
                fontSize: 11,
                fontFamily: theme.font.mono,
                color: theme.textFainter,
                background: theme.surfaceStrong,
                padding: "2px 8px",
                borderRadius: theme.radius.sm,
                letterSpacing: 0.5,
              }}
            >
              {t}
            </span>
          ))}
        </div>

        <ContentRenderer items={lesson.content} accent={mod.accent} />

        <div
          style={{
            borderTop: `1px solid ${theme.borderStrong}`,
            padding: "28px 0 40px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {prev ? (
            <button
              onClick={() => onGo("lesson", prev.mod, prev.lesson)}
              style={{
                background: "none",
                border: `1px solid ${theme.borderMuted}`,
                color: theme.textDim,
                padding: "8px 16px",
                borderRadius: theme.radius.md,
                cursor: "pointer",
                fontFamily: theme.font.mono,
                fontSize: 12,
              }}
            >
              ← Prev
            </button>
          ) : (
            <div />
          )}
          {next ? (
            <button
              onClick={() => {
                onMarkDone(lesson.id);
                onGo("lesson", next.mod, next.lesson);
              }}
              style={{
                background: mod.accent,
                border: "none",
                color: theme.bg,
                padding: "8px 16px",
                borderRadius: theme.radius.md,
                cursor: "pointer",
                fontFamily: theme.font.mono,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={() => {
                onMarkDone(lesson.id);
                onGo("home");
              }}
              style={{
                background: mod.accent,
                border: "none",
                color: theme.bg,
                padding: "8px 16px",
                borderRadius: theme.radius.md,
                cursor: "pointer",
                fontFamily: theme.font.mono,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Finish ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

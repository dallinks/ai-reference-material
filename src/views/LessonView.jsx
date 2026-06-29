import { theme } from "../theme.js";
import { Page, Header, Button, Eyebrow } from "../components/ui.jsx";
import { Blocks } from "../components/Blocks.jsx";
import { getCourse } from "../data/index.js";
import { useProgress } from "../state/useProgress.js";

export function LessonView({ courseId, unitId, lessonId, onGo }) {
  const course = getCourse(courseId);
  const unit = course.units.find((u) => u.id === unitId);
  const idx = unit.lessons.findIndex((l) => l.id === lessonId);
  const lesson = unit.lessons[idx];
  const { progress, markLesson } = useProgress(courseId);
  const done = progress.lessonsComplete.includes(lesson.id);
  const next = unit.lessons[idx + 1];
  const cardCount = lesson.reviewItems?.length || 0;

  return (
    <Page>
      <Header
        title={`${course.title} · ${unit.title}`}
        onBack={() => onGo("course", { courseId })}
        right={
          done ? (
            <span style={{ fontFamily: theme.font.mono, fontSize: 11, letterSpacing: 1, color: theme.status.open }}>◆ Completed</span>
          ) : (
            <Button variant="outline" accent={theme.status.open} onClick={() => markLesson(lesson)}>
              Mark complete
            </Button>
          )
        }
      />
      <div className="rise" style={{ maxWidth: theme.maxWidth.content, margin: "0 auto", padding: "52px 22px 64px" }}>
        <Eyebrow color={theme.status.open} style={{ marginBottom: 14 }}>
          Lesson {idx + 1} · {lesson.estMinutes} min
        </Eyebrow>
        <h1 style={{ fontSize: "clamp(30px,5vw,44px)", fontWeight: 400, lineHeight: 1.15, letterSpacing: "-0.02em", margin: "0 0 44px", color: theme.textStrong }}>
          {lesson.title}
        </h1>

        <Blocks items={lesson.content} />

        <div style={{ borderTop: `1px solid ${theme.borderStrong}`, marginTop: 20, paddingTop: 30, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          {!done ? (
            <Button accent={theme.status.open} onClick={() => markLesson(lesson)}>
              Mark complete · seed {cardCount} cards
            </Button>
          ) : (
            <span style={{ fontFamily: theme.font.mono, fontSize: 12, color: theme.status.open, letterSpacing: 0.5 }}>
              ◆ Completed — {cardCount} cards in review rotation
            </span>
          )}
          <div style={{ marginLeft: "auto" }}>
            {next ? (
              <Button variant="ghost" onClick={() => onGo("lesson", { courseId, unitId, lessonId: next.id })}>
                Next lesson →
              </Button>
            ) : (
              <Button accent={theme.status.passed} onClick={() => onGo("mastery", { courseId, unitId })}>
                To mastery check →
              </Button>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
}

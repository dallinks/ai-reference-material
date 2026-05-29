import { theme } from "../theme.js";
import { COURSE, totalLessons, allTags } from "../data/index.js";
import { LEARNING_PATHS, CAPSTONE } from "../data/paths.js";

function TypeChip({ kind, label }) {
  const tint = theme.chip[kind] || theme.chip.neutral;
  return (
    <span
      style={{
        fontSize: 10,
        fontFamily: theme.font.mono,
        color: tint.fg,
        background: tint.bg,
        padding: "2px 7px",
        borderRadius: theme.radius.sm,
      }}
    >
      {label || kind.toUpperCase()}
    </span>
  );
}

function SearchResultsList({ results, onGo }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          fontFamily: theme.font.mono,
          fontSize: 12,
          color: theme.textFaintest,
          marginBottom: 16,
          letterSpacing: 1,
        }}
      >
        {results.length} RESULT{results.length !== 1 ? "S" : ""}
      </div>
      {results.length === 0 && (
        <div style={{ color: theme.textFaintest, fontSize: 15 }}>
          No lessons match your search.
        </div>
      )}
      {results.map((l) => {
        const types = [...new Set(l.content.map((c) => c.type))];
        return (
          <div
            key={l.id}
            onClick={() => onGo("lesson", l.mod, l)}
            style={{
              padding: "14px 18px",
              background: theme.surface,
              border: `1px solid ${theme.border}`,
              borderLeft: `3px solid ${l.mod.accent}`,
              borderRadius: theme.radius.xl,
              marginBottom: 8,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = theme.surfaceHover)}
            onMouseOut={(e) => (e.currentTarget.style.background = theme.surface)}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div style={{ fontSize: 15, color: theme.textStrong, fontWeight: 500 }}>
                  {l.title}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    marginTop: 4,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: l.mod.accent,
                      fontFamily: theme.font.mono,
                    }}
                  >
                    M{l.mod.number}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: theme.textFaintest,
                      fontFamily: theme.font.mono,
                    }}
                  >
                    {l.duration}
                  </span>
                  {types.includes("code") && <TypeChip kind="code" />}
                  {types.includes("checklist") && <TypeChip kind="checklist" />}
                </div>
              </div>
              <span style={{ color: theme.textDimmest }}>→</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ModuleGrid({ completed, onGo }) {
  return (
    <>
      <div style={{ borderTop: `1px solid ${theme.border}`, marginBottom: 32 }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,360px),1fr))",
          gap: 14,
          paddingBottom: 60,
        }}
      >
        {COURSE.modules.map((mod) => {
          const done = mod.lessons.filter((l) => completed.has(l.id)).length;
          const pct = Math.round((done / mod.lessons.length) * 100);
          const hasCode = mod.lessons.some((l) => l.content.some((c) => c.type === "code"));
          const hasCheck = mod.lessons.some((l) => l.content.some((c) => c.type === "checklist"));
          return (
            <div
              key={mod.id}
              onClick={() => onGo("module", mod)}
              style={{
                padding: "24px 24px 20px",
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                borderRadius: theme.radius.xxl,
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = theme.surfaceHover;
                e.currentTarget.style.borderColor = mod.accent + "33";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = theme.surface;
                e.currentTarget.style.borderColor = theme.border;
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  right: 10,
                  fontFamily: theme.font.mono,
                  fontSize: 64,
                  fontWeight: 700,
                  color: mod.accent,
                  opacity: 0.06,
                }}
              >
                {mod.number}
              </div>
              <div
                style={{
                  fontFamily: theme.font.mono,
                  fontSize: 11,
                  letterSpacing: 3,
                  color: mod.accent,
                  marginBottom: 8,
                }}
              >
                MODULE {mod.number}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: theme.textStrong,
                  marginBottom: 6,
                  lineHeight: 1.3,
                }}
              >
                {mod.title}
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: theme.textFaint,
                  lineHeight: 1.5,
                  margin: "0 0 14px",
                }}
              >
                {mod.desc}
              </p>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {hasCode && <TypeChip kind="code" />}
                {hasCheck && <TypeChip kind="checklist" label="CHECKLISTS" />}
                <TypeChip kind="neutral" label={`${mod.lessons.length} LESSONS`} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    flex: 1,
                    height: 3,
                    background: theme.borderStrong,
                    borderRadius: 2,
                    overflow: "hidden",
                    maxWidth: 120,
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: mod.accent,
                      borderRadius: 2,
                      transition: "width 0.4s",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: theme.font.mono,
                    fontSize: 11,
                    color: theme.textFaintest,
                  }}
                >
                  {done}/{mod.lessons.length}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

function PathCard({ path, completed, onGo }) {
  const done = path.lessonIds.filter((id) => completed.has(id)).length;
  const total = path.lessonIds.length;
  return (
    <div
      onClick={() => onGo("path", null, null, path)}
      style={{
        padding: "18px 18px 16px",
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderTop: `2px solid ${path.accent}`,
        borderRadius: theme.radius.xxl,
        cursor: "pointer",
        transition: "background 0.15s",
        display: "flex",
        flexDirection: "column",
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = theme.surfaceHover)}
      onMouseOut={(e) => (e.currentTarget.style.background = theme.surface)}
    >
      <div
        style={{
          fontFamily: theme.font.mono,
          fontSize: 10,
          letterSpacing: 1.5,
          color: path.accent,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {path.audience}
      </div>
      <div style={{ fontSize: 17, fontWeight: 500, color: theme.textStrong, marginBottom: 6 }}>
        {path.title}
      </div>
      <p style={{ fontSize: 13, color: theme.textFaint, lineHeight: 1.5, margin: "0 0 12px", flex: 1 }}>
        {path.desc}
      </p>
      <div style={{ fontFamily: theme.font.mono, fontSize: 11, color: theme.textFaintest }}>
        {total} lessons · {done}/{total} done
      </div>
    </div>
  );
}

function LearningPaths({ completed, onGo }) {
  const capIds = CAPSTONE.stages.flatMap((s) => s.lessonIds);
  const capDone = capIds.filter((id) => completed.has(id)).length;

  return (
    <div style={{ marginBottom: 40 }}>
      <div
        style={{
          fontFamily: theme.font.mono,
          fontSize: 11,
          letterSpacing: 2,
          color: theme.textFaintest,
          marginBottom: 14,
        }}
      >
        NEW HERE? FOLLOW A PATH
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))",
          gap: 12,
          marginBottom: 12,
        }}
      >
        {LEARNING_PATHS.map((p) => (
          <PathCard key={p.id} path={p} completed={completed} onGo={onGo} />
        ))}
      </div>
      <div
        onClick={() => onGo("path", null, null, CAPSTONE)}
        style={{
          padding: "18px 20px",
          background: `${CAPSTONE.accent}0d`,
          border: `1px solid ${CAPSTONE.accent}40`,
          borderRadius: theme.radius.xxl,
          cursor: "pointer",
          transition: "background 0.15s",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = `${CAPSTONE.accent}1a`)}
        onMouseOut={(e) => (e.currentTarget.style.background = `${CAPSTONE.accent}0d`)}
      >
        <div
          style={{
            fontSize: 22,
            color: CAPSTONE.accent,
            flexShrink: 0,
          }}
        >
          ✦
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 500, color: theme.textStrong }}>
            {CAPSTONE.title}
          </div>
          <div style={{ fontSize: 13, color: theme.textFaint, marginTop: 2 }}>
            Build one real thing end-to-end, across every module.
          </div>
        </div>
        <div style={{ fontFamily: theme.font.mono, fontSize: 11, color: CAPSTONE.accent }}>
          {capDone}/{capIds.length} →
        </div>
      </div>
    </div>
  );
}

export function HomeView({ completed, search, onGo }) {
  const pct = Math.round((completed.size / totalLessons) * 100);
  const results = search.results;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.font.serif,
      }}
    >
      <div
        style={{
          maxWidth: theme.maxWidth.home,
          margin: "0 auto",
          padding: "clamp(32px,6vw,64px) 20px 0",
        }}
      >
        <div
          style={{
            fontFamily: theme.font.mono,
            fontSize: 11,
            letterSpacing: 4,
            color: theme.accent.orange,
            marginBottom: 16,
            textTransform: "uppercase",
          }}
        >
          Reference · {COURSE.modules.length} Modules · {totalLessons} Lessons
        </div>
        <h1
          style={{
            fontSize: "clamp(32px,6vw,56px)",
            fontWeight: 400,
            lineHeight: 1.1,
            margin: "0 0 12px",
            color: theme.textStrong,
            maxWidth: 650,
          }}
        >
          {COURSE.title}
        </h1>
        <p
          style={{
            fontSize: "clamp(15px,2vw,18px)",
            color: theme.textFainter,
            margin: "0 0 28px",
            fontStyle: "italic",
          }}
        >
          {COURSE.subtitle}
        </p>

        {/* Progress */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div
            style={{
              flex: 1,
              maxWidth: theme.maxWidth.progress,
              height: 4,
              background: theme.borderStrong,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: `linear-gradient(90deg,${theme.accent.orange},${theme.accent.pink})`,
                borderRadius: 2,
                transition: "width 0.4s",
              }}
            />
          </div>
          <span
            style={{
              fontFamily: theme.font.mono,
              fontSize: 12,
              color: theme.textFaintest,
            }}
          >
            {completed.size}/{totalLessons} · {pct}%
          </span>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 12 }}>
          <input
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            placeholder="Search lessons, topics, code patterns..."
            style={{
              width: "100%",
              maxWidth: theme.maxWidth.search,
              padding: "10px 14px",
              background: theme.surfaceStrong,
              border: `1px solid ${theme.borderMuted}`,
              borderRadius: theme.radius.lg,
              color: theme.text,
              fontSize: 14,
              fontFamily: theme.font.serif,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Tag filters */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 32 }}>
          {search.tag && (
            <button
              onClick={() => search.setTag(null)}
              style={{
                fontSize: 11,
                fontFamily: theme.font.mono,
                color: theme.accent.pink,
                background: "rgba(255,51,102,0.1)",
                border: "1px solid rgba(255,51,102,0.3)",
                padding: "3px 10px",
                borderRadius: theme.radius.md,
                cursor: "pointer",
                letterSpacing: 0.5,
              }}
            >
              ✕ Clear
            </button>
          )}
          {allTags.map((t) => {
            const active = search.tag === t;
            return (
              <button
                key={t}
                onClick={() => search.setTag(active ? null : t)}
                style={{
                  fontSize: 11,
                  fontFamily: theme.font.mono,
                  color: active ? theme.bg : "#888",
                  background: active ? theme.accent.yellow : theme.surfaceStrong,
                  border: `1px solid ${active ? theme.accent.yellow : theme.borderStrong}`,
                  padding: "3px 10px",
                  borderRadius: theme.radius.md,
                  cursor: "pointer",
                  letterSpacing: 0.5,
                }}
              >
                {t}
              </button>
            );
          })}
        </div>

        {results ? (
          <SearchResultsList results={results} onGo={onGo} />
        ) : (
          <>
            <LearningPaths completed={completed} onGo={onGo} />
            <ModuleGrid completed={completed} onGo={onGo} />
          </>
        )}
      </div>
    </div>
  );
}

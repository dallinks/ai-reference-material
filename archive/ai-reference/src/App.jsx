import { theme } from "./theme.js";
import { useNavigation } from "./hooks/useNavigation.js";
import { useProgress } from "./hooks/useProgress.js";
import { useSearch } from "./hooks/useSearch.js";
import { HomeView } from "./views/HomeView.jsx";
import { ModuleView } from "./views/ModuleView.jsx";
import { LessonView } from "./views/LessonView.jsx";
import { AssessmentView } from "./views/AssessmentView.jsx";
import { PathView } from "./views/PathView.jsx";

function Loading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          color: theme.textDimmest,
          fontFamily: theme.font.mono,
          fontSize: 13,
          letterSpacing: 2,
        }}
      >
        LOADING...
      </div>
    </div>
  );
}

export default function App() {
  const { view, activeMod, activeLesson, activePath, contentRef, go } = useNavigation();
  const { completed, ready, toggle, markDone } = useProgress();
  const search = useSearch();

  if (!ready) return <Loading />;

  if (view === "lesson" && activeMod && activeLesson) {
    return (
      <LessonView
        mod={activeMod}
        lesson={activeLesson}
        completed={completed}
        onToggle={toggle}
        onMarkDone={markDone}
        onGo={go}
        contentRef={contentRef}
      />
    );
  }

  if (view === "assessment" && activeMod) {
    return <AssessmentView mod={activeMod} onGo={go} />;
  }

  if (view === "path" && activePath) {
    return <PathView path={activePath} completed={completed} onGo={go} />;
  }

  if (view === "module" && activeMod) {
    return <ModuleView mod={activeMod} completed={completed} onGo={go} />;
  }

  return <HomeView completed={completed} search={search} onGo={go} />;
}

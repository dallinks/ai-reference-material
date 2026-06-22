import { useState } from "react";
import { todayStr } from "./lib/srs.js";
import { DashboardView } from "./views/DashboardView.jsx";
import { CourseView } from "./views/CourseView.jsx";
import { LessonView } from "./views/LessonView.jsx";
import { MasteryCheckView } from "./views/MasteryCheckView.jsx";
import { ReviewView } from "./views/ReviewView.jsx";
import { SettingsModal } from "./components/SettingsModal.jsx";

// Tiny state router. One view at a time; navigating remounts the target view, so
// each pulls fresh progress from the store on mount.
export default function App() {
  const [route, setRoute] = useState({ view: "dashboard" });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const today = todayStr();

  const go = (view, params = {}) => {
    window.scrollTo(0, 0);
    setRoute({ view, ...params });
  };
  const openSettings = () => setSettingsOpen(true);

  let view;
  switch (route.view) {
    case "course":
      view = <CourseView courseId={route.courseId} onGo={go} />;
      break;
    case "lesson":
      view = <LessonView courseId={route.courseId} unitId={route.unitId} lessonId={route.lessonId} onGo={go} />;
      break;
    case "mastery":
      view = <MasteryCheckView courseId={route.courseId} unitId={route.unitId} onGo={go} onOpenSettings={openSettings} />;
      break;
    case "review":
      view = <ReviewView onGo={go} today={today} />;
      break;
    default:
      view = <DashboardView onGo={go} today={today} onOpenSettings={openSettings} />;
  }

  return (
    <>
      {view}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

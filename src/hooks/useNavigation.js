import { useCallback, useRef, useState } from "react";

export function useNavigation() {
  const [view, setView] = useState("home");
  const [activeMod, setActiveMod] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const contentRef = useRef(null);

  const go = useCallback((nextView, mod, lesson) => {
    setView(nextView);
    if (mod) setActiveMod(mod);
    if (lesson) setActiveLesson(lesson);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, []);

  return { view, activeMod, activeLesson, contentRef, go };
}

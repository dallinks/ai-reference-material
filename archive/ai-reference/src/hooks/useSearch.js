import { useMemo, useState } from "react";
import { allLessonsFlat } from "../data/index.js";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(null);

  const results = useMemo(() => {
    if (!query && !tag) return null;
    const q = query.toLowerCase();
    return allLessonsFlat.filter((lesson) => {
      const matchTag = !tag || lesson.tags.includes(tag);
      const matchQuery =
        !query ||
        lesson.title.toLowerCase().includes(q) ||
        lesson.tags.some((t) => t.includes(q)) ||
        lesson.content.some((c) =>
          (c.body || c.heading || "").toLowerCase().includes(q)
        );
      return matchTag && matchQuery;
    });
  }, [query, tag]);

  return { query, setQuery, tag, setTag, results };
}

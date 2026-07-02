import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";
import { initStore } from "./lib/store.js";

// Storage decides its tier before first render (SQLite server vs localStorage
// fallback), so every view keeps its synchronous reads. Local either way —
// this resolves in milliseconds.
initStore().then(() => {
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// סגנונות שהיו קבצי תיקון נפרדים באתר החי. נטענים באותו סדר כמו באתר החי.
import "./styles/print-calendar-and-tip-fix.css";
import "./styles/calendar-multi-photo-v1.css";
import "./styles/mobile-tools-v4.css";
import "./styles/v36-targeted-fixes.css";
import "./styles/therapist-tabs-v1.css";
import "./styles/therapist-session-board-v1.css";
import "./styles/therapist-board-signs-v93.css";
import "./styles/therapist-board-games-v1.css";
import "./styles/v92-board-and-search.css";
import "./styles/mobile-search-filters-v1.css";
import "./styles/calendar-qa-v27.css";
import "./styles/mobile-calendar-compact-v1.css";
import "./styles/mobile-guidance-cards-v1.css";
import "./styles/english-ltr-v1.css";
import "./styles/site-shell.css";

// בספארי באייפון חלון ההדפסה נפתח לפעמים לפני שהעמוד מוכן להדפסה, ויוצא קובץ ריק.
// השהיה קצרה מונעת את זה.
const nativePrint = window.print.bind(window);
window.print = () => window.setTimeout(nativePrint, 400);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

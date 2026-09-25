import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/lib/language";
import { headTags, resolveSeo } from "@/lib/seo";

// Loads only the data a page needs (an activity page does not download the recipes).
async function loadContent(path) {
  if (path.startsWith("/activity/")) {
    const [{ SEED_ACTIVITIES }, { activityHero }, { activityEnglishContent }, { activityTitle }] = await Promise.all([
      import("@/lib/activities-data"), import("@/lib/activity-icons"), import("@/lib/activity-content-en"), import("@/lib/content-translations"),
    ]);
    return { activities: SEED_ACTIVITIES, activityHero, activityEnglish: activityEnglishContent, activityTitle };
  }
  if (path.startsWith("/board-game/")) {
    const [{ BOARD_GAMES }, { BOARD_GAMES_EN }] = await Promise.all([import("@/lib/board-games-data"), import("@/lib/board-games-en")]);
    return { boardGames: BOARD_GAMES, boardGamesEnglish: BOARD_GAMES_EN };
  }
  if (path.startsWith("/parent/recipes/")) {
    const [{ RECIPES }, { RECIPE_EN }] = await Promise.all([import("@/pages/TherapistRecipes"), import("@/lib/recipe-content-en")]);
    return { recipes: RECIPES, recipesEnglish: RECIPE_EN };
  }
  if (path.startsWith("/parent/experiments/")) {
    const [{ EXPERIMENTS, experimentHero }, { EXPERIMENT_EN }] = await Promise.all([import("@/pages/TherapistExperiments"), import("@/lib/experiment-content-en")]);
    return { experiments: EXPERIMENTS, experimentHero, experimentsEnglish: EXPERIMENT_EN };
  }
  return null;
}

// Older recipe and experiment links (?r=, ?e=) describe the page at its own address.
function pagePath(pathname, search) {
  const params = new URLSearchParams(search);
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/parent/recipes" && params.get("r")) return `/parent/recipes/${params.get("r")}`;
  if (path === "/parent/experiments" && params.get("e")) return `/parent/experiments/${params.get("e")}`;
  return path;
}

export function SeoManager() {
  const { pathname, search } = useLocation();
  const [language] = useLanguage();

  useEffect(() => {
    let cancelled = false;
    const path = pagePath(pathname, search);
    loadContent(path).then((content) => {
      if (cancelled) return;
      const seo = resolveSeo(path, language, content) || resolveSeo("/not-found", language, null);
      document.documentElement.lang = language;
      document.documentElement.dir = language === "he" ? "rtl" : "ltr";
      // The saved HTML of each page already carries the same tags; this keeps them right
      // after moving between pages inside the site.
      document.head.querySelectorAll('title, meta[name="description"], meta[name="robots"], link[rel="canonical"], link[rel="alternate"][hreflang], meta[property^="og:"], meta[name^="twitter:"], script[type="application/ld+json"]').forEach((node) => node.remove());
      const template = document.createElement("template");
      template.innerHTML = headTags(seo).join("");
      document.head.append(template.content);
    });
    return () => { cancelled = true; };
  }, [pathname, search, language]);

  return null;
}

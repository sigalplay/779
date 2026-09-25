const KEY = "boo_nesahek_subscription";

export const PRICES = { monthly: 19.9, yearly: 180, launchYearly: 150 };
export const LIMITS = { freeBoards: 1, premiumBoards: Number.POSITIVE_INFINITY, freeFavorites: 5, freeGeneratorRuns: 1 };
export const SUBSCRIPTIONS_ENABLED = false;

export function getSubscription() {
  try { return JSON.parse(localStorage.getItem(KEY)) || { plan: "free" }; }
  catch { return { plan: "free" }; }
}

export function hasPremiumAccess() {
  const sub = getSubscription();
  return sub.plan === "premium" && (!sub.expiresAt || new Date(sub.expiresAt) > new Date());
}

export function weeklyBoardLimit() {
  if (!SUBSCRIPTIONS_ENABLED) return Number.POSITIVE_INFINITY;
  return hasPremiumAccess() ? LIMITS.premiumBoards : LIMITS.freeBoards;
}

export function checkoutUrl(plan) {
  const urls = {
    monthly: import.meta.env.VITE_CHECKOUT_MONTHLY_URL,
    yearly: import.meta.env.VITE_CHECKOUT_YEARLY_URL,
    launch: import.meta.env.VITE_CHECKOUT_LAUNCH_URL,
  };
  return urls[plan] || "";
}

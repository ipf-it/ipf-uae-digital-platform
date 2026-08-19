const KEY = "ipf-mobile-intro";

export function markMobileIntroPlayed() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* private mode */
  }
}

export function shouldPlayMobileIntro() {
  if (typeof window === "undefined") return false;
  if (!window.matchMedia("(max-width: 1023px)").matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return sessionStorage.getItem(KEY) !== "1";
  } catch {
    return true;
  }
}

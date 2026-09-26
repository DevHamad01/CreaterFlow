/**
 * Sanitises the `returnTo` query param so a crafted link can't bounce a
 * freshly-authenticated user to an external origin.
 *
 * @param {string} [search] defaults to the current location's query string
 * @param {string} [fallback]
 * @returns {string} a same-origin path that is safe to navigate to
 */
export function safeReturnTo(search, fallback = "/app") {
  const query =
    search ?? (typeof window !== "undefined" ? window.location.search : "");
  const raw = new URLSearchParams(query).get("returnTo");
  if (!raw) return fallback;

  try {
    const base =
      typeof window !== "undefined" ? window.location.origin : "http://localhost";
    const url = new URL(raw, base);
    if (url.origin !== base) return fallback;
    const path = url.pathname + url.search;
    if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
      return fallback;
    }
    return path;
  } catch {
    return fallback;
  }
}

/**
 * @param {string | null} [path]
 * @returns {string} the same-origin path encoded as a returnTo param, or "" when
 * there is nothing worth carrying over
 */
export function returnToParam(path) {
  return path && path !== "/app" ? `?returnTo=${encodeURIComponent(path)}` : "";
}

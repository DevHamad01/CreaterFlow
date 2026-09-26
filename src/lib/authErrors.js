/**
 * Auth error helpers shared by Login / Register so the copy stays consistent
 * and raw Firebase messages don't leak into the UI.
 */

const CANCELLED = /popup-closed|popup-closed-by-user|cancelled|canceled/i;

/** @param {any} err */
export function isCancelledAuthError(err) {
  return CANCELLED.test(err?.code || err?.message || "");
}

/**
 * @param {any} err
 * @param {string} fallback
 * @returns {string} a human-readable, actionable message
 */
export function friendlyAuthError(err, fallback) {
  const code = err?.code || "";

  if (/invalid-credential|wrong-password|user-not-found/i.test(code)) {
    return "That email and password combination doesn't match an account.";
  }
  if (/email-already-in-use/i.test(code)) {
    return "An account with that email already exists. Try logging in instead.";
  }
  if (/weak-password/i.test(code)) {
    return "Passwords must be at least 6 characters.";
  }
  if (/email-already-used|invalid-email/i.test(code)) {
    return "That doesn't look like a valid email address.";
  }
  if (/operation-not-allowed|unauthorized-domain/i.test(code)) {
    return "Email sign-in isn't enabled for this project yet. Try Google sign-in.";
  }
  if (/too-many-requests/i.test(code)) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (/requires-recent-login/i.test(code)) {
    return "For security, log in again before making this change.";
  }
  if (/network-request-failed|internal-error/i.test(code)) {
    return "We couldn't reach the network. Check your connection and try again.";
  }

  return err?.message || fallback;
}

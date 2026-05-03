/**
 * Centralized paths — reuse in <Link>, navigate(), etc.
 */
export const ROUTES = {
  HOME: "/",
  AUTH: "/auth",

  DASHBOARD: "/dashboard",
  OFFRES: "/offres",
  CANDIDATURES: "/candidatures",
  PROFIL: "/profil",

  ADMIN: "/admin",
  ADMIN_OFFRES: "/admin/offres",
  ADMIN_CANDIDATS: "/admin/candidats",
  ADMIN_CANDIDATURES: "/admin/candidatures",
};

/** Auth URL query — use with `authPath()` */
export const AUTH_MODE = {
  LOGIN: "login",
  REGISTER: "register",
};

/** @param {typeof AUTH_MODE.LOGIN | typeof AUTH_MODE.REGISTER} mode */
export function authPath(mode) {
  const m =
    mode === AUTH_MODE.REGISTER ? AUTH_MODE.REGISTER : AUTH_MODE.LOGIN;
  return `${ROUTES.AUTH}?mode=${m}`;
}

/** Anchors on the landing page (scroll targets) */
export const LANDING_ANCHOR = {
  HOW_IT_WORKS: "comment-ca-marche",
  LEGAL: "mentions-legales",
  PRIVACY: "confidentialite",
};

/** @param {string} anchorId — e.g. LANDING_ANCHOR.HOW_IT_WORKS */
export function homeWithHash(anchorId) {
  return `${ROUTES.HOME}#${anchorId}`;
}

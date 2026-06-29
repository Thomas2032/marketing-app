export const DEMO_USER_ID = "demo-user";

/**
 * `true` = live API (set `NEXT_PUBLIC_USE_BACKEND=true` in `.env.local`).
 * Default `false` = mock data in sessionStorage — no backend required for UI testing.
 */
export const USE_BACKEND = process.env.NEXT_PUBLIC_USE_BACKEND === "true";

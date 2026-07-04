export const APP_NAME = "Superior Minds Academy";
export const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "__session";
export const SESSION_COOKIE_EXPIRES_DAYS = Number(
  process.env.SESSION_COOKIE_EXPIRES_DAYS || 5
);

export const ROUTES = {
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  unauthorized: "/unauthorized",
} as const;

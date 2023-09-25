import { createAssign, createReducerMap } from "@app/slice-helpers";
import { AppState, Env } from "@app/types";

export const createEnv = (e: Partial<Env> = {}): Env => {
  return {
    isProduction: import.meta.env.PROD,
    isDev: import.meta.env.DEV,
    appUrl: import.meta.env.VITE_APP_URL || "",
    authUrl: import.meta.env.VITE_AUTH_URL || "",
    billingUrl: import.meta.env.VITE_BILLING_URL || "",
    apiUrl: import.meta.env.VITE_API_URL || "",
    metricTunnelUrl: import.meta.env.VITE_METRIC_TUNNEL_URL || "",
    sentryDsn: import.meta.env.VITE_SENTRY_DSN || "",
    origin: (import.meta.env.VITE_ORIGIN as any) || "app",
    legacyDashboardUrl:
      import.meta.env.VITE_LEGACY_DASHBOARD_URL ||
      "https://dashboard.aptible.com",
    stripePublishableKey:
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
      "pk_test_eiw5HXHTAgTwyNnV9I5ruCrA",
    tinaApiKey: import.meta.env.VITE_TINA_API_KEY || "",
    tinaClientId: import.meta.env.VITE_TINA_CLIENT_ID || "",
    ...e,
  };
};

export const ENV_NAME = "env";
const env = createAssign<Env>({
  name: ENV_NAME,
  initialState: createEnv(),
});

export const { set: setEnv, reset: resetEnv } = env.actions;
export const reducers = createReducerMap(env);
export const selectEnv = (state: AppState) => state[ENV_NAME];
export const selectOrigin = (state: AppState) => selectEnv(state).origin;
export const selectLegacyDashboardUrl = (state: AppState) =>
  selectEnv(state).legacyDashboardUrl;

import { Provider } from "react-redux";
import {
  Route,
  RouteObject,
  RouterProvider,
  Routes,
  createMemoryRouter,
} from "react-router";
import { MemoryRouter } from "react-router-dom";
import { prepareStore } from "saga-query";

import { reducers, rootEntities, sagas } from "@app/app";
import { ftuxRoutes } from "@app/app/router";
import { bootup } from "@app/bootup";
import { testEnv } from "@app/mocks";
import type { AppState } from "@app/types";
import { configureStore } from "@reduxjs/toolkit";
import { REHYDRATE } from "redux-persist";

export const setupTestStore = (initState: Partial<AppState> = {}) => {
  const middleware = [];
  const prepared = prepareStore({
    reducers: reducers,
    sagas: sagas,
  });

  middleware.push(...prepared.middleware);

  const store = configureStore({
    preloadedState: { ...initState, entities: rootEntities },
    reducer: prepared.reducer,
    devTools: false,
    middleware: middleware,
  });

  prepared.run();

  return { store };
};

/**
 * This function helps simulate booting the entire app as if it were
 * the browser.  All of redux, redux-saga, and redux-persist are loaded
 * and configured.
 *
 * We also dispatch the `booup()` saga which fetches a bunch of data.
 */
export const setupAppIntegrationTest = (
  {
    routes = ftuxRoutes,
    initState = {},
    initEntries = [],
  }: Partial<{
    routes: RouteObject[];
    initState: Partial<AppState>;
    initEntries: string[];
  }> = {
    routes: ftuxRoutes,
    initState: {},
    initEntries: [],
  },
) => {
  const router = createMemoryRouter(routes, { initialEntries: initEntries });
  const { store } = setupTestStore({
    ...initState,
    env: testEnv,
  });
  store.dispatch(bootup());
  store.dispatch({ type: REHYDRATE });
  const App = () => {
    return (
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    );
  };
  return { store, router, App };
};

export const setupIntegrationTest = (
  {
    path = "/",
    initState = {},
    initEntries = ["/"],
  }: {
    path?: string;
    initState?: Partial<AppState>;
    initEntries?: string[];
  } = { path: "/", initState: {}, initEntries: ["/"] },
) => {
  const { store } = setupTestStore({
    ...initState,
    env: testEnv,
  });
  store.dispatch(bootup());
  store.dispatch({ type: REHYDRATE });

  const TestProvider = ({ children }: { children: React.ReactNode }) => {
    return (
      <Provider store={store}>
        <MemoryRouter initialEntries={initEntries}>
          <Routes>
            <Route path={path} element={children} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };
  return { store, TestProvider };
};

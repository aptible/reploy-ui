import type { Store } from "@reduxjs/toolkit";
import { StrictMode } from "react";
import { Provider, useSelector } from "react-redux";

import type { AppState } from "@app/types";
import { ModalPortal, StandaloneErrorBoundary } from "@app/ui";

import { ftuxRouter, router } from "./router";
import { selectOrigin } from "@app/env";
import { RouterProvider } from "react-router";

const AppRouter = () => {
  const origin = useSelector(selectOrigin);
  return (
    <div className="h-full w-full">
      <StandaloneErrorBoundary>
        <ModalPortal />
      </StandaloneErrorBoundary>
      <RouterProvider router={origin === "nextgen" ? router : ftuxRouter} />
    </div>
  );
};

export const App = ({ store }: { store: Store<AppState> }) => {
  return (
    <StrictMode>
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </StrictMode>
  );
};

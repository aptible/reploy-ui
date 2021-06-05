import {
  createLoader,
  createLoaderTable,
  createReducerMap,
  defaultLoadingItem,
} from 'robodux';

import { AppState, AuthLoader, AuthLoaderMessage } from '@app/types';

export const LOADERS_NAME = 'loaders';
export const loaders = createLoaderTable({ name: LOADERS_NAME });
export const { selectTable: selectLoaders } = loaders.getSelectors(
  (s: AppState) => s[LOADERS_NAME] || {},
);
export const selectLoaderById = (state: AppState, { id }: { id: string }) => {
  return selectLoaders(state)[id] || defaultLoadingItem();
};

const AUTH_LOADER_NAME = 'authLoader';

export const defaultAuthLoader = (): AuthLoader => ({
  loading: false,
  success: false,
  error: false,
  message: {
    error: '',
    message: '',
    code: 0,
    exception_context: {},
  },
  lastRun: 0,
  lastSuccess: 0,
  meta: {},
});
const authLoader = createLoader<AuthLoaderMessage>({
  name: AUTH_LOADER_NAME,
  initialState: defaultAuthLoader(),
});
export const {
  loading: setAuthLoaderStart,
  error: setAuthLoaderError,
  success: setAuthLoaderSuccess,
  reset: resetAuthLoader,
} = authLoader.actions;

export const reducers = createReducerMap(loaders, authLoader);

export const selectAuthLoader = (state: AppState) =>
  state[AUTH_LOADER_NAME] || defaultAuthLoader();

export const selectAuthLoaderMessage = (state: AppState) => {
  const curLoader = selectAuthLoader(state);
  const { message } = curLoader;
  return message || { error: '', message: '', code: 0, exception_context: {} };
};

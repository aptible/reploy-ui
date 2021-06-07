import { put } from 'redux-saga/effects';
import { ActionWithPayload, createAction } from 'robodux';
import { batchActions } from 'redux-batched-actions';

import {
  setAuthLoaderStart,
  setAuthLoaderError,
  setAuthLoaderSuccess,
} from '@app/loaders';
import { CreateTokenPayload, createToken, TokenCtx } from '@app/token';

export const loginSuccess = createAction('LOGIN_SUCCESS');
export const login = createAction<CreateTokenPayload>('LOGIN');
export function* onLogin(action: ActionWithPayload<CreateTokenPayload>) {
  yield put(setAuthLoaderStart());
  const ctx: TokenCtx = yield createToken.run(action.payload);

  if (!ctx.response.ok) {
    const { message, error, code, exception_context } = ctx.response.data;
    yield put(
      setAuthLoaderError({
        message,
        meta: { error, code, exception_context },
      }),
    );
    return;
  }

  yield put(batchActions([setAuthLoaderSuccess(), loginSuccess()]));
}

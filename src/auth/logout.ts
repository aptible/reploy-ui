import {
  batchActions,
  parallel,
  put,
  select,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";

import { authApi, thunks } from "@app/api";
import { resetStore } from "@app/reset-store";
import {
  resetElevatedToken,
  selectElevatedToken,
  selectToken,
} from "@app/token";

export const deleteToken = authApi.delete<{ id: string }>("/tokens/:id");

export const logout = thunks.create("logout", function* (ctx, next) {
  yield* put(setLoaderStart({ id: ctx.name }));
  const token = yield* select(selectToken);
  const elevatedToken = yield* select(selectElevatedToken);
  const group = yield* parallel([
    () => deleteToken.run(deleteToken({ id: token.tokenId })),
    () => deleteToken.run(deleteToken({ id: elevatedToken.tokenId })),
  ]);
  yield* group;
  yield* next();
  yield* put(
    batchActions([
      resetStore(),
      resetElevatedToken(),
      setLoaderSuccess({ id: ctx.name }),
    ]),
  );
});

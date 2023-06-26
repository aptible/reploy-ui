import { call, select, take } from "@app/fx";
import { REHYDRATE } from "redux-persist";

import { thunks } from "@app/api";
import { fetchCurrentToken } from "@app/auth";
import { onFetchInitData } from "@app/initial-data";
import { selectAccessToken } from "@app/token";
import { ApiGen } from "@app/types";

export const bootup = thunks.create(
  "bootup",
  function* onBootup(_, next): ApiGen {
    // wait for redux-persist to rehydrate redux store
    yield* take(REHYDRATE);
    yield* call(fetchCurrentToken.run, fetchCurrentToken());
    const token: string = yield* select(selectAccessToken);
    if (!token) {
      return;
    }

    yield* call(onFetchInitData);

    yield next();
  },
);

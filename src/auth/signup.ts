import {
  call,
  put,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";

import { thunks } from "@app/api";
import { createLog } from "@app/debug";
import { ApiGen, AuthApiCtx } from "@app/types";
import { CreateUserForm, createUser } from "@app/users";

import { AUTH_LOADER_ID } from "./loader";
import { createOrganization } from "./organization";
import { createToken, elevateToken } from "./token";
import { createSignupBillingRecords } from "@app/billing";

const log = createLog("signup");

function* setAuthError(ctx: AuthApiCtx) {
  if (ctx.json.ok) {
    return;
  }
  const { message, ...meta } = ctx.json.data;
  yield put(setLoaderError({ id: AUTH_LOADER_ID, message, meta }));
}

export const signup = thunks.create<CreateUserForm>(
  "signup",
  function* onSignup(ctx, next): ApiGen {
    const { company, name, email, password } = ctx.payload;
    const orgName = company;
    yield* put(setLoaderStart({ id: AUTH_LOADER_ID }));

    const userCtx = yield* call(createUser.run, createUser(ctx.payload));

    log(userCtx);

    if (!userCtx.json.ok) {
      yield* call(setAuthError, userCtx);
      return;
    }

    const tokenCtx = yield* call(
      createToken.run,
      createToken({
        username: email,
        password,
        otpToken: "",
        makeCurrent: true,
      }),
    );

    log(tokenCtx);

    if (!tokenCtx.json.ok) {
      yield* call(setAuthError, tokenCtx);
      return;
    }

    const orgCtx = yield* call(
      createOrganization.run,
      createOrganization({ name: orgName }),
    );

    log(orgCtx);

    if (!orgCtx.json.ok) {
      yield* call(setAuthError, orgCtx);
      return;
    }

    const billsCtx = yield* call(
      createSignupBillingRecords.run,
      createSignupBillingRecords({
        orgId: orgCtx.json.data.id,
        orgName,
        contactName: name,
        contactEmail: email,
      }),
    );

    if (!billsCtx.json.ok) {
      const { message, ...meta } = billsCtx.json.data;
      yield* put(setLoaderError({ id: AUTH_LOADER_ID, message, meta }));
      return;
    }

    log(billsCtx);

    const elevateCtx = yield* call(
      elevateToken.run,
      elevateToken({ username: email, password, otpToken: "" }),
    );

    log(elevateCtx);

    yield* put(
      setLoaderSuccess({
        id: AUTH_LOADER_ID,
        meta: {
          id: userCtx.json.data.id,
          verified: userCtx.json.data.verified,
        },
      }),
    );
    yield* next();
  },
);

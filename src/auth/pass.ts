import { authApi, elevatedUpdate } from "@app/api";
import { selectOrigin } from "@app/config";
import { select } from "@app/fx";
import { revokeTokensMdw } from "./token";

export const forgotPass = authApi.post<{ email: string }>(
  "/password/resets/new",
  function* (ctx, next) {
    const email = ctx.payload.email;
    const origin = yield* select(selectOrigin);
    if (!origin || !email) {
      return;
    }

    ctx.request = ctx.req({
      body: JSON.stringify({
        email,
        origin,
      }),
    });

    yield* next();

    ctx.loader = {
      message: "If this is a valid email, you will recieve an email with instructions.",
    };
  },
);

interface ResetPass {
  challengeId: string;
  password: string;
  verificationCode: string;
}

export const resetPass = authApi.post<ResetPass>(
  ["/verifications", "pass"],
  function* (ctx, next) {
    const { challengeId, password, verificationCode } = ctx.payload;
    ctx.request = ctx.req({
      body: JSON.stringify({
        type: "password_reset_challenge",
        challenge_id: challengeId,
        password: password,
        verification_code: verificationCode,
      }),
    });

    yield* next();
  },
);

interface UpdatePassword {
  userId: string;
  type: "update-password";
  password: string;
}

export const updatePassword = authApi.patch<UpdatePassword>(
  ["/users/:userId", "pass"],
  [elevatedUpdate, revokeTokensMdw],
);

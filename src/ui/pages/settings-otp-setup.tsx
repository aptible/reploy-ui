import { useLoader } from "@app/fx";
import { selectOtp, setupOtp } from "@app/mfa";
import { settingsUrl } from "@app/routes";
import { selectCurrentUserId, updateSecurityUser } from "@app/users";
import QRCode from "qrcode.react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BannerMessages,
  Box,
  BoxGroup,
  Breadcrumbs,
  Button,
  ExternalLink,
  FormGroup,
  Input,
  Loading,
} from "../shared";

export const OtpSetupPage = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);
  const otpLoader = useLoader(setupOtp);
  const userLoader = useLoader(updateSecurityUser);
  const otp = useSelector(selectOtp);
  const [error, setError] = useState("");
  const [mfa, setMFA] = useState("");
  const [secret, setSecret] = useState("");

  useEffect(() => {
    if (!otp.uri) {
      return;
    }
    const search = new URLSearchParams(otp.uri.replace(/.*\?/, "?"));
    setSecret(search.get("secret") || "");
  }, [otp.uri]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    dispatch(setupOtp({ userId }));
  }, [userId]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userId) {
      return;
    }
    if (!otp.id) {
      return;
    }
    if (!mfa) {
      setError("must enter token");
      return;
    }

    dispatch(
      updateSecurityUser({
        type: "otp",
        userId,
        otp_enabled: true,
        current_otp_configuration: otp.currentUrl,
        current_otp_configuration_id: otp.id,
        otp_token: mfa,
      }),
    );
  };

  return (
    <BoxGroup>
      <Breadcrumbs
        crumbs={[
          { name: "Settings", to: settingsUrl() },
          { name: "2-Factor Authentication", to: null },
        ]}
      />
      <Box>
        <div>
          <div className="mb-2 text-md font-semibold">
            2-factor authentication will be enabled for your account after
            confirmation.
          </div>
          <div className="max-w-lg">
            To proceed, scan the QR code below with your 2FA app (we recommend
            using{" "}
            <ExternalLink
              href="https://support.google.com/accounts/answer/1066447?hl=en"
              variant="info"
            >
              Google Authenticator
            </ExternalLink>
            ), input the code generated, and click on Enable 2FA.
          </div>

          {otpLoader.isLoading ? (
            <Loading />
          ) : (
            <div>
              <div className="my-4">
                <div className="flex my-10 justify-center align-center max-w-lg">
                  <QRCode value={otp.uri} />
                </div>
                <div>
                  <b>Your 2FA URL:</b> {otp.uri}
                </div>
                <div>
                  <b>Your 2FA Secret:</b> {secret}
                </div>
              </div>
              <form
                onSubmit={onSubmit}
                className="flex flex-col gap-4 max-w-lg"
              >
                <FormGroup
                  label="2FA Token"
                  htmlFor="input-mfa"
                  feedbackVariant={error ? "danger" : "info"}
                >
                  <Input
                    name="mfa"
                    type="mfa"
                    value={mfa}
                    onChange={(e) => setMFA(e.currentTarget.value)}
                    data-testid="input-mfa"
                  />
                  <div>{error}</div>
                </FormGroup>
                <Button
                  type="submit"
                  disabled={!!error || !mfa}
                  isLoading={userLoader.isLoading}
                >
                  Enable 2FA
                </Button>
                <div>
                  <BannerMessages {...userLoader} />
                  {otpLoader.isError ? <BannerMessages {...otpLoader} /> : null}
                </div>
              </form>
            </div>
          )}
        </div>
      </Box>
    </BoxGroup>
  );
};

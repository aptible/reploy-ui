import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { useLoaderSuccess } from "saga-query/react";

import { elevate } from "@app/auth";
import { selectAuthLoader, selectIsOtpError } from "@app/auth";
import { homeUrl } from "@app/routes";
import { selectJWTToken } from "@app/token";

import { Alert, AptibleLogo, Button, FormGroup, Input } from "../shared";

export const ElevatePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectJWTToken);
  const location = useLocation();

  const [otpToken, setOtpToken] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [requireOtp, setRequireOtp] = useState<boolean>(false);
  const loader = useSelector(selectAuthLoader);

  useLoaderSuccess(loader, () => {
    const params = new URLSearchParams(location.search);
    const redirect = params.get("redirect");
    navigate(redirect || homeUrl());
  });

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(
      elevate({
        username: user.email,
        password,
        otpToken,
      }),
    );
  };

  const isOtpError = useSelector(selectIsOtpError);
  useEffect(() => {
    if (isOtpError) {
      setRequireOtp(true);
    }
  }, [isOtpError]);

  return (
    <div>
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex items-center justify-center">
            <AptibleLogo />
          </div>
          <h2 className="mt-6 text-center text-3xl font-semibold text-gray-900">
            Elevate token
          </h2>
          <p>
            We require a short-lived elevated token before allowing changes to
            authentication credentials (i.e. changing password, adding pubkey,
            disabling 2FA).
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={onSubmit}>
              {loader.isError ? (
                <div className="mb-8">
                  <Alert
                    title="Something went wrong"
                    variant="danger"
                    icon={
                      <div className="h-5 w-5 text-red-400" aria-hidden="true">
                        icon
                      </div>
                    }
                  >
                    <ul className="list-disc pl-5 space-y-1">
                      <li>{loader.message}</li>
                    </ul>
                  </Alert>
                </div>
              ) : null}

              <FormGroup label="Email" htmlFor="input-email">
                <Input
                  name="email"
                  type="email"
                  disabled={true}
                  value={user.email}
                  autoComplete="username"
                  autoFocus={true}
                  data-testid="input-email"
                  id="input-email"
                />
              </FormGroup>

              <FormGroup label="Password" htmlFor="password">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required={true}
                  value={password}
                  className="w-full"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </FormGroup>

              {requireOtp ? (
                <FormGroup label="2FA" htmlFor="input-2fa">
                  <Input
                    type="number"
                    value={otpToken}
                    onChange={(e) => setOtpToken(e.currentTarget.value)}
                    autoComplete="off"
                    id="input-2fa"
                    className="flex-1 outline-0 py-1 bg-transparent"
                    autoFocus
                  />
                </FormGroup>
              ) : null}

              <div>
                <Button
                  isLoading={loader.isLoading}
                  disabled={loader.isLoading}
                  type="submit"
                  layout="block"
                  size="lg"
                >
                  Elevate token
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

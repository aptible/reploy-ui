import { useLoader, useLoaderSuccess } from "@app/fx";
import qs from "query-string";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router";
import { Link } from "react-router-dom";

import { HeroBgLayout } from "../layouts";
import {
  AptibleLogo,
  BannerMessages,
  Button,
  CreateProjectFooter,
  FormGroup,
  Input,
  tokens,
} from "../shared";
import {
  fetchCurrentToken,
  selectAuthLoader,
  signup,
  validatePasswordComplexity,
} from "@app/auth";
import {
  fetchInvitation,
  selectInvitationRequest,
  selectPendingInvitation,
} from "@app/invitations";
import { resetRedirectPath, selectRedirectPath } from "@app/redirect-path";
import {
  acceptInvitationWithCodeUrl,
  homeUrl,
  loginUrl,
  verifyEmailRequestUrl,
} from "@app/routes";
import { validEmail } from "@app/string-utils";
import { selectIsUserAuthenticated } from "@app/token";

const createQueryStringValue =
  (queryString: string) => (key: string): string => {
    const values = qs.parse(queryString);
    const returnValue = values[key];

    if (returnValue && Array.isArray(returnValue)) {
      const [value] = returnValue;
      return value || "";
    }

    return returnValue || "";
  };

export const SignupPage = () => {
  const fetchTokenLoader = useLoader(fetchCurrentToken);
  const fetchSignupLoader = useSelector(selectAuthLoader);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const getQueryStringValue = createQueryStringValue(location.search);
  const redirectPath = useSelector(selectRedirectPath);
  const isAuthenticated = useSelector(selectIsUserAuthenticated);
  const { isLoading } = fetchSignupLoader;

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState(getQueryStringValue("email"));
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState("");

  const invitationRequest = useSelector(selectInvitationRequest);
  const invitation = useSelector(selectPendingInvitation);

  const [challengeToken] = useState<string>(getQueryStringValue("token"));

  useEffect(() => {
    if (fetchSignupLoader.isLoading) {
      return;
    }

    if (isAuthenticated) {
      navigate(homeUrl());
    }
  }, [fetchSignupLoader.isLoading, isAuthenticated]);

  useEffect(() => {
    if (!invitation && invitationRequest.invitationId) {
      dispatch(fetchInvitation({ id: invitationRequest.invitationId }));
    }
  }, [invitationRequest.invitationId]);

  const currentEmail = invitation ? invitation.email : email;

  const disableSave = name === "" || currentEmail === "" || password === "";

  const onSubmitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disableSave) {
      return;
    }

    if (!validEmail(email)) {
      setEmailError("Not a valid email");
      return;
    } else {
      setEmailError("");
    }

    const passwordErrors = validatePasswordComplexity(password);
    const passwordErrorMessage =
      password !== "" && passwordErrors.length > 0
        ? `Password ${passwordErrors.join(", ")}`
        : "";
    if (passwordErrorMessage) {
      setPassError(passwordErrorMessage);
      return;
    } else {
      setPassError("");
    }

    dispatch(
      signup({
        company,
        name,
        email: invitation ? invitation.email : email,
        password,
        challenge_token: challengeToken,
      }),
    );
  };

  useLoaderSuccess(fetchSignupLoader, () => {
    if (invitationRequest.invitationId) {
      navigate(acceptInvitationWithCodeUrl(invitationRequest));
    } else {
      // if the api returns with a user.verified = true, skip email request page
      // this can happen in development when ENV['DISABLE_EMAIL_VERIFICATION']=1
      if (fetchSignupLoader.meta.verified) {
        navigate(redirectPath || homeUrl());
        dispatch(resetRedirectPath());
        return;
      }
      navigate(verifyEmailRequestUrl());
    }
  });

  // presentError - this value is set because in specific scenarios, we do not need the
  // middleware error message presented - namely on Unauthorized checks, as we do a
  // validation of the current token to see if a user is loaded. for all other
  const presentError =
    fetchTokenLoader.isError && fetchTokenLoader.message !== "Unauthorized";

  return (
    <HeroBgLayout width={500} showLogo={false}>
      <div className="absolute top-0 left-0 h-auto min-h-[100vh] bg-white/90 shadow p-16 lg:block hidden w-[40vw] lg:px-[5%] px-[32px]">
        <div className="text-xl text-black font-bold">
          Launch, grow, and scale your app without worrying about infrastructure
        </div>
        <div className="text-lg text-gold font-bold pt-5 pb-1">Launch</div>
        <p>Get up and running without any work or config.</p>
        <hr className="mt-5 mb-4" />
        <div className="text-lg text-gold font-bold pb-1">Grow</div>
        <p>Aptible handles all the infrastructure operations.</p>
        <hr className="mt-5 mb-4" />
        <div className="text-lg text-gold font-bold pb-1">Scale</div>
        <p>
          Enterprise requirements such as performance, security, and reliability
          are baked in from day one.
        </p>
        <p className="text-md text-black pt-8 pb-4 text-center font-semibold">
          Companies that have scaled with Aptible
        </p>
        <img
          src="/customer-logo-cloud.png"
          className="text-center scale-90"
          aria-label="Customer Logos"
        />
        <div className="pt-8 lg:px-0 px-10">
          <CreateProjectFooter />
        </div>
      </div>
      <div className="absolute top-0 left-0  lg:w-[60vw] w-[100vw] lg:ml-[40vw] ml-auto lg:px-[5%] md:px-[32px] px-auto">
        <div className="flex flex-col justify-center items-center md:w-[500px] md:ml-[50%] md:left-[-250px] w-full ml-none left-0 relative">
          <div className="flex justify-center pt-10 pb-8">
            <AptibleLogo width={160} />
          </div>
          <div className="flex text-center items-center justify-center">
            <div className="max-w-2xl">
              <p className="lg:px-0 px-8 lg:min-w-[570px] min-w-full">
                Our web app and API hosting platform automates the work of
                provisioning, managing, and scaling infrastructure, so you can
                focus on what actually matters: <strong>your product.</strong>
              </p>
              <h1 className={`${tokens.type.h1} text-center pt-8`}>
                Get started for free
              </h1>
            </div>
          </div>
          <div className="mt-6">
            <div className="bg-white py-8 px-8 lg:px-10 shadow rounded-lg border border-black-100">
              <form className="space-y-4" onSubmit={onSubmitForm}>
                <FormGroup label="Name" htmlFor="name">
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    autoFocus={true}
                    required={true}
                    value={name}
                    disabled={isLoading}
                    className="w-full"
                    onChange={(e) => setName(e.target.value)}
                  />
                </FormGroup>

                <FormGroup label="Company" htmlFor="company">
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="company"
                    required={true}
                    value={company}
                    disabled={isLoading}
                    className="w-full"
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </FormGroup>

                <FormGroup
                  label="Email"
                  htmlFor="email"
                  feedbackVariant={emailError ? "danger" : "info"}
                  feedbackMessage={emailError}
                >
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required={true}
                    disabled={isLoading}
                    value={invitation ? invitation.email : email}
                    className="w-full"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormGroup>

                <FormGroup
                  label="Password"
                  htmlFor="password"
                  feedbackVariant={passError ? "danger" : "info"}
                  feedbackMessage={passError}
                >
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required={true}
                    value={password}
                    className="w-full"
                    disabled={isLoading}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </FormGroup>

                {presentError ? <BannerMessages {...fetchTokenLoader} /> : null}
                <BannerMessages {...fetchSignupLoader} />
                <div>
                  <Button
                    type="submit"
                    variant="primary"
                    layout="block"
                    size="lg"
                    disabled={disableSave}
                    isLoading={fetchTokenLoader.isLoading}
                  >
                    Create Account
                  </Button>
                </div>
                <p className="mt-4 text-center text-sm text-gray-600">
                  If you already have an account, you can{" "}
                  <Link to={loginUrl()} className="font-medium">
                    log in here
                  </Link>
                  .
                </p>
                <p className="mt-4 text-center text-sm text-gray-600">
                  By submitting this form, I confirm that I have read and agree
                  to Aptible's{" "}
                  <a href="https://www.aptible.com/legal/terms-of-service">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="https://www.aptible.com/legal/privacy">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            </div>
          </div>
        </div>
        <div className="mt-6 lg:px-0 px-10 lg:hidden block">
          <CreateProjectFooter />
        </div>
      </div>
    </HeroBgLayout>
  );
};

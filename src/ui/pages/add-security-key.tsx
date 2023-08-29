import { useCache, useLoader } from "@app/fx";
import { PublicKeyCredentialCreationOptionsJSON } from "@github/webauthn-json/dist/types/basic/json";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchU2fChallenges } from "@app/mfa";
import { selectCurrentUserId } from "@app/users";

import { createWebauthnDevice, webauthnCreate } from "@app/auth";
import { Banner, Button, FormGroup, Input } from "../shared";

interface U2fChallenge {
  id: string;
  challenge: string;
  payload: PublicKeyCredentialCreationOptionsJSON;
}

export const AddSecurityKeyPage = () => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const userId = useSelector(selectCurrentUserId);
  const challenge = useCache<U2fChallenge>(fetchU2fChallenges({ userId }));
  const dispatch = useDispatch();
  const loader = useLoader(createWebauthnDevice);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name) {
      setError("name must not be blank");
      return;
    }

    if (challenge.isError) {
      setError(challenge.message);
      return;
    }

    if (!challenge.data) {
      setError("could not load u2f challenge");
      return;
    }

    setError("");
    const u2f = await webauthnCreate({ publicKey: challenge.data.payload });
    dispatch(createWebauthnDevice({ userId, name, u2f }));
  };

  return (
    <div>
      <div>
        Security Keys are hardware devices that can be used for two-factor
        authentication. To sign in using a Security Key, you press a button on
        the device, rather than type in a token.
      </div>
      <div>
        Security Keys help protect against phishing, and as a result, they can
        be more secure than token-based two-factor authentication.
      </div>

      <form onSubmit={onSubmit}>
        <FormGroup
          label="Name"
          htmlFor="input-name"
          feedbackVariant={error ? "danger" : "info"}
        >
          <Input
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            autoComplete="username"
          />
          <div>Pick a name that helps you remember this key</div>
        </FormGroup>
        {error ? <Banner variant="error">{error}</Banner> : null}
        {loader.isError ? (
          <Banner variant="error">{loader.message}</Banner>
        ) : null}
        <div>
          <Button type="submit" isLoading={loader.isLoading}>
            Register
          </Button>
        </div>
      </form>
    </div>
  );
};

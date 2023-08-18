import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import {
  CreateDbEndpointProps,
  fetchDatabase,
  fetchService,
  parseIpStr,
  provisionDatabaseEndpoint,
  selectDatabaseById,
} from "@app/deploy";
import { useLoader, useLoaderSuccess, useQuery } from "@app/fx";
import { endpointDetailUrl } from "@app/routes";
import { AppState } from "@app/types";
import { ipValidator } from "@app/validator";

import { useValidator } from "../hooks";
import {
  Banner,
  BannerMessages,
  Box,
  ButtonCreate,
  ExternalLink,
  Form,
  FormGroup,
  TextArea,
} from "../shared";

const validators = {
  ipAllowlist: (data: CreateDbEndpointProps) => ipValidator(data.ipAllowlist),
};

export const DatabaseCreateEndpointPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  useQuery(fetchDatabase({ id }));
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  useQuery(fetchService({ id: db.serviceId }));

  const [ipAllowlist, setIpAllowlist] = useState("");

  const createData = (): CreateDbEndpointProps => {
    return {
      ipAllowlist: parseIpStr(ipAllowlist),
      envId: db.environmentId,
      serviceId: db.serviceId,
    };
  };

  const [errors, validate] = useValidator<
    CreateDbEndpointProps,
    typeof validators
  >(validators);
  const formData = createData();
  const action = provisionDatabaseEndpoint(formData);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate(formData)) return;
    dispatch(action);
  };

  const loader = useLoader(action);
  useLoaderSuccess(loader, () => {
    navigate(endpointDetailUrl(loader.meta.endpointId));
  });

  return (
    <Box className="flex flex-col gap-4">
      <h1 className="text-lg text-black font-semibold">Create Endpoint</h1>

      <Banner variant="warning">
        Database Endpoints let you expose your Deploy databases on the public
        internet. They are useful if you need to grant third party access to
        your database. If you only need to access your database from Deploy
        apps, you do not need an Endpoint: simply use your database credentials
        to connect.
      </Banner>

      <Banner variant="warning">
        Before exposing this database to the internet, please consider the
        connection security advice in our{" "}
        <ExternalLink
          variant="info"
          href="https://www.aptible.com/docs/database-endpoints"
        >
          Database Endpoint documentation
        </ExternalLink>
        .
      </Banner>

      <Form onSubmit={onSubmit}>
        <FormGroup
          label="IP Allowlist"
          htmlFor="ip-allowlist"
          description="Only traffic from the following sources is allowed. Add more sources (IPv4 addresses and CIDRs) by separating them with spaces or newlines."
          feedbackMessage={errors.ipAllowlist}
          feedbackVariant={errors.ipAllowlist ? "danger" : "info"}
        >
          <TextArea
            id="ip-allowlist"
            aria-label="ip-allowlist"
            value={ipAllowlist}
            onChange={(e) => setIpAllowlist(e.currentTarget.value)}
          />
        </FormGroup>

        <BannerMessages {...loader} />

        <ButtonCreate
          envId={db.environmentId}
          isLoading={loader.isLoading}
          type="submit"
          className="w-[200px]"
        >
          Save Endpoint
        </ButtonCreate>
      </Form>
    </Box>
  );
};

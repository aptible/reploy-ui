import { selectAppsByEnvId } from "../app";
import { selectEndpointsByEnvironmentId } from "../endpoint";
import { selectDeploy } from "../slice";
import { api } from "@app/api";
import { defaultEntity, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { AppState, DeployCertificate, LinkResponse } from "@app/types";
import { createSelector } from "@reduxjs/toolkit";

interface DeployCertificateResponse {
  id: number;
  common_name: string;
  certificate_body: string;
  not_before: string;
  not_after: string;
  issuer_country?: string;
  issuer_organization?: string;
  issuer_website?: string;
  issuer_common_name?: string;
  subject_country?: string;
  subject_state?: string;
  subject_locale?: string;
  subject_organization?: string;
  acme: boolean;
  leaf_certificate: string;
  certificate_chain: string;
  sha256_fingerprint: string;
  trusted: boolean;
  self_signed: boolean;
  subject_alternative_names: string[];
  private_key_algorithm: string;
  private_key: string;
  created_at: string;
  updated_at: string;
  _links: {
    account: LinkResponse;
  };
}

export const deserializeCertificate = (
  payload: DeployCertificateResponse,
): DeployCertificate => {
  const links = payload._links;

  return {
    id: payload.id.toString(),
    commonName: payload.common_name,
    certificateBody: payload.certificate_body,
    notBefore: payload.not_before,
    notAfter: payload.not_after,
    issuerCountry: payload.issuer_country,
    issuerOrganization: payload.issuer_organization,
    issuerWebsite: payload.issuer_website,
    issuerCommonName: payload.issuer_common_name,
    subjectCountry: payload.subject_country,
    subjectState: payload.subject_state,
    subjectLocale: payload.subject_locale,
    subjectOrganization: payload.subject_organization,
    acme: payload.acme,
    leafCertificate: payload.leaf_certificate,
    certificateChain: payload.certificate_chain,
    sha256Fingerprint: payload.sha256_fingerprint,
    trusted: payload.trusted,
    selfSigned: payload.self_signed,
    subjectAlternativeNames: payload.subject_alternative_names,
    privateKeyAlgorithm: payload.private_key_algorithm,
    privateKey: payload.private_key,
    createdAt: payload.created_at,
    updatedAt: payload.updated_at,
    environmentId: extractIdFromLink(links.account),
  };
};

export const defaultDeployCertificate = (
  c: Partial<DeployCertificate> = {},
): DeployCertificate => {
  const now = new Date().toISOString();
  return {
    id: "",
    commonName: "",
    certificateBody: "",
    notBefore: now,
    notAfter: now,
    issuerCountry: "",
    issuerOrganization: "",
    issuerWebsite: "",
    issuerCommonName: "",
    subjectCountry: "",
    subjectState: "",
    subjectLocale: "",
    subjectOrganization: "",
    acme: false,
    leafCertificate: "",
    certificateChain: "",
    sha256Fingerprint: "",
    trusted: false,
    selfSigned: true,
    subjectAlternativeNames: [],
    privateKeyAlgorithm: "",
    privateKey: "",
    createdAt: now,
    updatedAt: now,
    environmentId: "",
    ...c,
  };
};

export const DEPLOY_CERTIFICATE_NAME = "certificates";
const slice = createTable<DeployCertificate>({
  name: DEPLOY_CERTIFICATE_NAME,
});
const { add: addDeployCertificates } = slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_CERTIFICATE_NAME],
);
const initCertificate = defaultDeployCertificate();
const must = mustSelectEntity(initCertificate);
export const selectCertificateById = must(selectors.selectById);
export const { selectTableAsList: selectCertificatesAsList } = selectors;
export const hasDeployCertificate = (a: DeployCertificate) => a.id !== "";

export const selectCertificatesByEnvId = createSelector(
  selectCertificatesAsList,
  (_: AppState, props: { envId: string }) => props.envId,
  (certs, envId) => {
    return certs.filter((cert) => cert.environmentId === envId);
  },
);

export const certificateReducers = createReducerMap(slice);

export const fetchCertificatesByEnvironmentId = api.get<{ id: string }>(
  "/accounts/:id/certificates",
);

export const certificateEntities = {
  certificate: defaultEntity({
    id: "certificate",
    deserialize: deserializeCertificate,
    save: addDeployCertificates,
  }),
};

export const selectAppsByCertificateId = createSelector(
  selectAppsByEnvId,
  selectEndpointsByEnvironmentId,
  (_: AppState, p: { certificateId: string }) => p.certificateId,
  (apps, endpoints, certificateId) => {
    const endpointsWithCertificates = endpoints.filter(
      (endpoint) => endpoint.certificateId === certificateId,
    );

    return apps.filter((app) => {
      return app.serviceIds.some((appServiceId) => {
        return endpointsWithCertificates.find(
          (endpoint) => endpoint.serviceId === appServiceId,
        );
      });
    });
  },
);

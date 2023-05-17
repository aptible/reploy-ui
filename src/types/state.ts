import type {
  DeployApp,
  DeployCertificate,
  DeployDatabase,
  DeployDatabaseImage,
  DeployDisk,
  DeployEndpoint,
  DeployEnvironment,
  DeployLogDrain,
  DeployMetricDrain,
  DeployOperation,
  DeployService,
  DeployServiceDefinition,
  DeployStack,
} from "./deploy";
import type { EntityMap } from "./hal";
import type { MapEntity } from "./helpers";
import type { Invitation, InvitationRequest } from "./invitations";
import type { ModalState } from "./modal";
import { Toast } from "./toast";
import type { QueryState } from "saga-query";

export interface Env {
  isProduction: boolean;
  isDev: boolean;
  authUrl: string;
  billingUrl: string;
  apiUrl: string;
  sentryDsn: string;
  legacyDashboardUrl: string;
  origin: "nextgen" | "app";
}

export interface Feedback {
  preDeploySurveyAnswered: boolean;
  freeformFeedbackGiven: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  otpEnabled: boolean;
  superuser: boolean;
  username: string;
  verified: boolean;
  currentOtpId: string;
}

export interface Token {
  tokenId: string;
  accessToken: string;
  userUrl: string;
  actorUrl: string;
}

export interface AuthApiError {
  message: string;
  error: string;
  code: number;
  exception_context: { [key: string]: any };
}

export interface Organization {
  id: string;
  name: string;
}

export interface U2fDevice {
  id: string;
  name: string;
  version: string;
  keyHandle: string;
  createdAt: string;
  updatedAt: string;
}

export interface Otp {
  id: string;
  uri: string;
  recoveryCodesUrl: string;
  currentUrl: string;
}

export type Theme = "light" | "dark";

export interface DeployState {
  apps: MapEntity<DeployApp>;
  certificates: MapEntity<DeployCertificate>;
  endpoints: MapEntity<DeployEndpoint>;
  environments: MapEntity<DeployEnvironment>;
  serviceDefinitions: MapEntity<DeployServiceDefinition>;
  stacks: MapEntity<DeployStack>;
  disks: MapEntity<DeployDisk>;
  databases: MapEntity<DeployDatabase>;
  databaseImages: MapEntity<DeployDatabaseImage>;
  services: MapEntity<DeployService>;
  logDrains: MapEntity<DeployLogDrain>;
  metricDrains: MapEntity<DeployMetricDrain>;
  operations: MapEntity<DeployOperation>;
}

export interface AppState extends QueryState {
  env: Env;
  feedback: Feedback;
  users: MapEntity<User>;
  token: Token;
  elevatedToken: Token;
  invitationRequest: InvitationRequest;
  invitations: MapEntity<Invitation>;
  entities: EntityMap;
  redirectPath: string;
  organizationSelected: string;
  organizations: MapEntity<Organization>;
  u2fDevices: MapEntity<U2fDevice>;
  otp: Otp;
  data: MapEntity<any>;
  theme: Theme;
  deploy: DeployState;
  modal: ModalState;
  toast: Toast[];
}

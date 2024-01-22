import {
  BillingDetail,
  ContainerMetrics,
  EmbeddedMap,
  Feedback,
  ModalState,
  ModalType,
  Nav,
  ResourceStats,
  Role,
  U2fDevice,
} from "@app/types";
import { createSchema, slice } from "starfx/store";
import * as factory from "./factory";

export const [schema, initialState] = createSchema({
  cache: slice.table(),
  loaders: slice.loader<any>(),
  env: slice.obj(factory.defaultConfig()),
  feedback: slice.obj<Feedback>({
    preDeploySurveyAnswered: false,
    freeformFeedbackGiven: false,
  }),
  users: slice.table({ empty: factory.defaultUser() }),
  token: slice.obj(factory.defaultToken()),
  elevatedToken: slice.obj(factory.defaultToken()),
  invitations: slice.table({ empty: factory.defaultInvitation() }),
  entities: slice.table<EmbeddedMap>(),
  redirectPath: slice.str(),
  organizationSelected: slice.str(),
  organizations: slice.table({ empty: factory.defaultOrganization() }),
  u2fDevices: slice.table<U2fDevice>(),
  otp: slice.obj(factory.defaultOtp()),
  theme: slice.str("light"),
  nav: slice.obj<Nav>({ collapsed: false }),
  modal: slice.obj<ModalState>({ type: ModalType.NONE, props: {} }),
  roles: slice.table<Role>({ empty: factory.defaultRole() }),
  currentUserRoles: slice.any<string[]>([]),
  signal: slice.any(new AbortController()),
  resourceStats: slice.table<ResourceStats>(),
  containerMetrics: slice.table<ContainerMetrics>(),
  billingDetail: slice.obj<BillingDetail>(factory.defaultBillingDetail()),
  apps: slice.table({ empty: factory.defaultDeployApp() }),
  appConfigs: slice.table({ empty: factory.defaultDeployAppConfig() }),
  certificates: slice.table({ empty: factory.defaultDeployCertificate() }),
  endpoints: slice.table({ empty: factory.defaultDeployEndpoint() }),
  environments: slice.table({ empty: factory.defaultDeployEnvironment() }),
  environmentStats: slice.table({
    empty: factory.defaultDeployEnvironmentStats(),
  }),
  serviceDefinitions: slice.table({
    empty: factory.defaultDeployServiceDefinition(),
  }),
  stacks: slice.table({ empty: factory.defaultDeployStack() }),
  disks: slice.table({ empty: factory.defaultDeployDisk() }),
  databases: slice.table({ empty: factory.defaultDeployDatabase() }),
  databaseCredentials: slice.table({
    empty: factory.defaultDatabaseCredential(),
  }),
  databaseImages: slice.table({ empty: factory.defaultDeployDatabaseImage() }),
  services: slice.table({ empty: factory.defaultDeployService() }),
  logDrains: slice.table({ empty: factory.defaultDeployLogDrain() }),
  metricDrains: slice.table({ empty: factory.defaultDeployMetricDrain() }),
  operations: slice.table({ empty: factory.defaultDeployOperation() }),
  activePlans: slice.table({ empty: factory.defaultActivePlan() }),
  plans: slice.table({ empty: factory.defaultPlan() }),
  permissions: slice.table({ empty: factory.defaultPermission() }),
  releases: slice.table({ empty: factory.defaultDeployRelease() }),
  containers: slice.table({ empty: factory.defaultDeployContainer() }),
  vpcPeers: slice.table({ empty: factory.defaultDeployVpcPeer() }),
  vpnTunnels: slice.table({ empty: factory.defaultDeployVpnTunnel() }),
  backups: slice.table({ empty: factory.defaultDeployBackup() }),
  backupRps: slice.table({ empty: factory.defaultBackupRp() }),
  activityReports: slice.table({
    empty: factory.defaultDeployActivityReport(),
  }),
  images: slice.table({ empty: factory.defaultDeployImage() }),
  memberships: slice.table({ empty: factory.defaultMembership() }),
});
export type WebState = typeof initialState;

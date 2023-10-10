import { createAction, createSelector } from "@reduxjs/toolkit";

import { api, cacheMinTimer, cacheShortTimer, thunks } from "@app/api";
import {
  call,
  poll,
  put,
  select,
  setLoaderError,
  setLoaderStart,
  setLoaderSuccess,
} from "@app/fx";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import type {
  AcmeConfiguration,
  AcmeStatus,
  AppState,
  DeployEndpoint,
  EndpointType,
  LinkResponse,
  ProvisionableStatus,
} from "@app/types";

import { selectEnv } from "@app/env";
import { findAppById, selectApps, selectAppsByEnvId } from "../app";
import { createCertificate } from "../certificate";
import {
  findDatabaseById,
  selectDatabases,
  selectDatabasesByOrgAsList,
} from "../database";
import { selectEnvironmentsByOrgAsList } from "../environment";
import { DeployOperationResponse } from "../operation";
import {
  findServiceById,
  selectAppToServicesMap,
  selectEnvToServicesMap,
  selectServices,
  selectServicesByAppId,
} from "../service";
import { selectDeploy } from "../slice";

export interface DeployEndpointResponse {
  id: number;
  acme: boolean;
  acme_configuration: AcmeConfiguration | null;
  acme_dns_challenge_host: string;
  acme_status: string;
  container_exposed_ports: string[] | null;
  container_port: string | null;
  container_ports: string[];
  default: boolean;
  docker_name: string | null;
  elastic_load_balancer_name: string | null;
  external_host: string | null;
  external_http_port: string | null;
  external_https_port: string | null;
  internal: boolean;
  internal_health_port: string | null;
  internal_host: string | null;
  internal_http_port: string | null;
  internal_https_port: string | null;
  ip_whitelist: string[];
  platform: "alb" | "elb";
  security_group_id: string;
  type: EndpointType;
  user_domain: string;
  virtual_domain: string;
  status: ProvisionableStatus;
  created_at: string;
  updated_at: string;
  _links: {
    service: LinkResponse;
    certificate: LinkResponse;
  };
  _type: "vhost";
}

export const defaultEndpointResponse = (
  resp: Partial<DeployEndpointResponse> = {},
): DeployEndpointResponse => {
  const now = new Date().toISOString();
  return {
    id: 0,
    acme: false,
    acme_configuration: null,
    acme_status: "",
    acme_dns_challenge_host: "",
    container_exposed_ports: [],
    container_port: "",
    container_ports: [],
    default: true,
    docker_name: "",
    elastic_load_balancer_name: "",
    external_host: "",
    external_http_port: "",
    external_https_port: "",
    internal: false,
    internal_health_port: "",
    internal_host: "",
    internal_http_port: "",
    internal_https_port: "",
    ip_whitelist: [],
    platform: "elb",
    type: "unknown",
    user_domain: "",
    virtual_domain: "",
    security_group_id: "",
    status: "unknown",
    created_at: now,
    updated_at: now,
    _links: {
      service: defaultHalHref(),
      certificate: defaultHalHref(),
    },
    _type: "vhost",
    ...resp,
  };
};

export const deserializeDeployEndpoint = (
  payload: DeployEndpointResponse,
): DeployEndpoint => {
  return {
    id: `${payload.id}`,
    acme: payload.acme,
    acmeConfiguration: payload.acme_configuration,
    acmeDnsChallengeHost: payload.acme_dns_challenge_host,
    acmeStatus: payload.acme_status as AcmeStatus,
    containerExposedPorts: payload.container_exposed_ports,
    containerPort: payload.container_port || "",
    containerPorts: payload.container_ports,
    createdAt: payload.created_at,
    default: payload.default,
    dockerName: payload.docker_name || "",
    externalHost: payload.external_host || "",
    externalHttpPort: payload.external_http_port || "",
    externalHttpsPort: payload.external_https_port || "",
    internal: payload.internal,
    ipWhitelist: payload.ip_whitelist,
    platform: payload.platform,
    type: payload.type as EndpointType,
    updatedAt: payload.updated_at,
    userDomain: payload.user_domain,
    virtualDomain: payload.virtual_domain,
    status: payload.status,
    serviceId: extractIdFromLink(payload._links.service),
    certificateId: extractIdFromLink(payload._links.certificate),
  };
};

export const defaultDeployEndpoint = (
  e: Partial<DeployEndpoint> = {},
): DeployEndpoint => {
  const now = new Date().toISOString();
  return {
    id: "",
    status: "pending",
    acme: false,
    acmeConfiguration: null,
    acmeDnsChallengeHost: "",
    acmeStatus: "pending",
    containerExposedPorts: [],
    containerPort: "",
    containerPorts: [],
    default: false,
    dockerName: "",
    externalHost: "",
    externalHttpPort: "",
    externalHttpsPort: "",
    internal: false,
    ipWhitelist: [],
    platform: "elb",
    type: "unknown",
    createdAt: now,
    updatedAt: now,
    userDomain: "",
    virtualDomain: "",
    serviceId: "",
    certificateId: "",
    ...e,
  };
};

export const DEPLOY_ENDPOINT_NAME = "endpoints";
const slice = createTable<DeployEndpoint>({
  name: DEPLOY_ENDPOINT_NAME,
});
const { add: addDeployEndpoints, remove: removeDeployEndpoints } =
  slice.actions;
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[DEPLOY_ENDPOINT_NAME],
);
const initApp = defaultDeployEndpoint();
const must = mustSelectEntity(initApp);
const {
  selectTable: selectEndpoints,
  selectTableAsList: selectEndpointsAsList,
} = selectors;
export const selectEndpointById = must(selectors.selectById);
export const findEndpointById = must(selectors.findById);
export { selectEndpoints, selectEndpointsAsList };
export const hasDeployEndpoint = (a: DeployEndpoint) => a.id !== "";
export const endpointReducers = createReducerMap(slice);

export const selectEndpointsByAppId = createSelector(
  selectEndpointsAsList,
  selectServicesByAppId,
  (endpoints, services) => {
    return endpoints.filter((end) =>
      services.map((service) => service.id).includes(end.serviceId),
    );
  },
);

export const selectFirstEndpointByAppId = createSelector(
  selectEndpointsByAppId,
  (endpoints) => {
    if (endpoints.length === 0) {
      return defaultDeployEndpoint();
    }

    return endpoints[0];
  },
);

const selectServiceToDbMap = createSelector(
  selectDatabasesByOrgAsList,
  (dbs) => {
    const serviceToDbId: Record<string, string | undefined> = {};
    dbs.forEach((db) => {
      serviceToDbId[db.serviceId] = db.id;
    });

    return serviceToDbId;
  },
);

export const selectEndpointsByEnvironmentId = createSelector(
  selectEnvToServicesMap,
  selectEndpointsAsList,
  (_: AppState, p: { envId: string }) => p.envId,
  (envToServiceMap, enps, envId) =>
    enps.filter((enp) => envToServiceMap[envId]?.has(enp.serviceId)),
);

export const selectEndpointsByOrgAsList = createSelector(
  selectEnvToServicesMap,
  selectEndpointsAsList,
  selectEnvironmentsByOrgAsList,
  (envToServiceMap, enps, envs) => {
    return enps.filter((enp) =>
      envs.some((env) => envToServiceMap[env.id]?.has(enp.serviceId)),
    );
  },
);

export interface DeployEndpointRow extends DeployEndpoint {
  resourceType: "database" | "app" | "unknown";
  resourceId: string;
  resourceHandle: string;
}

export const selectEndpointsForTable = createSelector(
  selectEndpointsByOrgAsList,
  selectServices,
  selectApps,
  selectDatabases,
  (enps, servicesMap, apps, dbs) => {
    return enps
      .map((enp): DeployEndpointRow => {
        const service = findServiceById(servicesMap, { id: enp.serviceId });

        if (service.appId) {
          const app = findAppById(apps, { id: service.appId });
          return {
            ...enp,
            resourceType: "app",
            resourceHandle: app.handle,
            resourceId: app.id,
          };
        }

        if (service.databaseId) {
          const app = findDatabaseById(dbs, { id: service.databaseId });
          return {
            ...enp,
            resourceType: "database",
            resourceHandle: app.handle,
            resourceId: app.id,
          };
        }

        return {
          ...enp,
          resourceType: "unknown",
          resourceHandle: "",
          resourceId: "",
        };
      })
      .sort((a, b) => getEndpointUrl(a).localeCompare(getEndpointUrl(b)));
  },
);

const computeSearchMatch = (
  enp: DeployEndpointRow,
  search: string,
): boolean => {
  if (search === "") {
    return true;
  }
  const url = getEndpointUrl(enp);
  const handle = enp.resourceHandle.toLocaleLowerCase();
  const plc = getPlacement(enp);
  const placement = plc === "Private" ? "private" : "public";
  const placementAlt = plc === "Private" ? "internal" : "external";

  const urlMatch = url.includes(search);
  const handleMatch = handle.includes(search);
  const placementMatch =
    placement.includes(search) || placementAlt.includes(search);
  const idMatch = search === enp.id;

  return urlMatch || handleMatch || placementMatch || idMatch;
};

export const selectEndpointsForTableSearch = createSelector(
  selectEndpointsForTable,
  (_: AppState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (enps, search): DeployEndpointRow[] => {
    if (search === "") {
      return enps;
    }

    return enps.filter((enp) => computeSearchMatch(enp, search));
  },
);

export const selectEndpointsByServiceId = createSelector(
  selectEndpointsForTable,
  (_: AppState, p: { search: string }) => p.search.toLocaleLowerCase(),
  (_: AppState, p: { serviceId: string }) => p.serviceId,
  (enps, search, serviceId): DeployEndpointRow[] => {
    return enps.filter(
      (enp) => serviceId === enp.serviceId && computeSearchMatch(enp, search),
    );
  },
);

export const selectEndpointsByEnvIdForTableSearch = createSelector(
  selectEndpointsForTable,
  selectEnvToServicesMap,
  (_: AppState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: AppState, props: { envId: string }) => props.envId,
  (enps, envToServiceMap, search, envId): DeployEndpointRow[] => {
    return enps.filter((enp) => {
      const serviceIds = envToServiceMap[envId];
      const envIdMatch = serviceIds?.has(enp.serviceId);
      if (!envIdMatch) return false;
      const searchMatch = computeSearchMatch(enp, search);
      return searchMatch;
    });
  },
);

export const selectEndpointsByAppIdForTableSearch = createSelector(
  selectEndpointsForTable,
  selectServices,
  (_: AppState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: AppState, props: { appId: string }) => props.appId,
  (enps, servicesMap, search, appId): DeployEndpointRow[] => {
    return enps.filter((enp) => {
      const service = findServiceById(servicesMap, { id: enp.serviceId });
      if (service.appId !== appId) return false;
      const searchMatch = computeSearchMatch(enp, search);
      return searchMatch;
    });
  },
);

export const selectEndpointsByDbIdForTableSearch = createSelector(
  selectEndpointsForTable,
  selectServiceToDbMap,
  (_: AppState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: AppState, props: { dbId: string }) => props.dbId,
  (enps, serviceToDbMap, search, dbId): DeployEndpointRow[] => {
    return enps.filter((enp) => {
      const foundDbId = serviceToDbMap[enp.serviceId];
      if (foundDbId !== dbId) return false;
      const searchMatch = computeSearchMatch(enp, search);
      return searchMatch;
    });
  },
);

export const selectEndpointsByCertIdForTableSearch = createSelector(
  selectEndpointsForTable,
  (_: AppState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: AppState, props: { certId: string }) => props.certId,
  (enps, search, certId): DeployEndpointRow[] => {
    return enps.filter((enp) => {
      if (certId !== enp.certificateId) return false;
      const searchMatch = computeSearchMatch(enp, search);
      return searchMatch;
    });
  },
);

export const selectEndpointsByCertId = createSelector(
  selectEndpointsByEnvironmentId,
  (_: AppState, p: { certId: string }) => p.certId,
  (endpoints, certId) =>
    endpoints.filter((endpoint) => endpoint.certificateId === certId),
);

export const selectAppsByCertId = createSelector(
  selectAppsByEnvId,
  selectAppToServicesMap,
  selectEndpointsByCertId,
  (apps, appToServicesMap, endpoints) => {
    return apps.filter((app) => {
      const serviceIds = appToServicesMap[app.id] || [];
      return serviceIds.some((appServiceId) =>
        endpoints.find((endpoint) => endpoint.serviceId === appServiceId),
      );
    });
  },
);

export const fetchEndpointsByAppId = api.get<{ appId: string }>(
  "/apps/:appId/vhosts",
  { saga: cacheShortTimer() },
);
export const fetchEndpointsByDatabaseId = api.get<{ dbId: string }>(
  "/databases/:dbId/vhosts",
  { saga: cacheShortTimer() },
);
export const fetchEndpointsByEnvironmentId = api.get<{ id: string }>(
  "/accounts/:id/vhosts",
  { saga: cacheShortTimer() },
);
export const fetchEndpointsByServiceId = api.get<{ id: string }>(
  "/services/:id/vhosts",
  {
    saga: cacheShortTimer(),
  },
);

export const fetchEndpoint = api.get<{ id: string }>("/vhosts/:id", {
  saga: cacheShortTimer(),
});

export const fetchEndpoints = api.get("/vhosts?per_page=5000", {
  saga: cacheMinTimer(),
});

export const cancelFetchEndpointPoll = createAction(
  "cancel-fetch-endpoint-poll",
);
export const pollFetchEndpoint = api.get<{ id: string }>(
  ["/vhosts/:id", "poll"],
  { saga: poll(5 * 1000, `${cancelFetchEndpointPoll}`) },
);

export const cancelEndpointOpsPoll = createAction("cancel-enp-ops-poll");
export const pollEndpointOperations = api.get<{ id: string }>(
  ["/vhosts/:id/operations", "poll"],
  { saga: poll(5 * 1000, `${cancelEndpointOpsPoll}`) },
  api.cache(),
);

export const endpointEntities = {
  vhost: defaultEntity({
    id: "vhost",
    deserialize: deserializeDeployEndpoint,
    save: addDeployEndpoints,
  }),
};

export type EndpointManagedType = "default" | "managed" | "custom";

interface CreateEndpointBase {
  type: EndpointManagedType;
  envId: string;
  serviceId: string;
  internal: boolean;
  ipAllowlist: string[];
  containerPort?: string;
}

interface CreateDefaultEndpoint extends CreateEndpointBase {
  type: "default";
}

interface CreateManagedEndpoint extends CreateEndpointBase {
  type: "managed";
  domain: string;
  certId: string;
  cert?: string;
  privKey?: string;
}

interface CreateCustomEndpoint extends CreateEndpointBase {
  type: "custom";
  certId: string;
  cert: string;
  privKey: string;
}

export type CreateEndpointProps =
  | CreateDefaultEndpoint
  | CreateManagedEndpoint
  | CreateCustomEndpoint;

export const createEndpoint = api.post<
  CreateEndpointProps & { certId: string }
>("/services/:serviceId/vhosts", function* (ctx, next) {
  const env = yield* select(selectEnv);
  const data: Record<string, any> = {
    platform: "alb",
    type: "http_proxy_protocol",
    acme: ctx.payload.type === "managed",
    default: ctx.payload.type === "default",
    internal: ctx.payload.internal,
    ip_whitelist: ctx.payload.ipAllowlist,
    container_port: ctx.payload.containerPort,
  };

  if (ctx.payload.certId) {
    data.certificate = `${env.apiUrl}/certificates/${ctx.payload.certId}`;
  }

  if (ctx.payload.type === "managed") {
    data.user_domain = ctx.payload.domain;
  }

  const body = JSON.stringify(data);
  ctx.request = ctx.req({ body });

  yield* next();
});

export interface CreateDbEndpointProps {
  ipAllowlist: string[];
  serviceId: string;
  envId: string;
}

export const createDatabaseEndpoint = api.post<CreateDbEndpointProps>(
  ["/services/:serviceId/vhosts", "db"],
  function* (ctx, next) {
    const data = {
      type: "tcp",
      platform: "elb",
      ip_whitelist: ctx.payload.ipAllowlist,
      acme: false,
      default: false,
      internal: false,
    };
    const body = JSON.stringify(data);
    ctx.request = ctx.req({ body });
    yield* next();
  },
);

export const deleteEndpoint = api.delete<{ id: string }>(
  "/vhosts/:id",
  function* (ctx, next) {
    yield* next();
    ctx.actions.push(removeDeployEndpoints([ctx.payload.id]));
  },
);

interface CreateEndpointOpProps {
  endpointId: string;
  type: string;
}

export const createEndpointOperation = api.post<
  CreateEndpointOpProps,
  DeployOperationResponse
>("/vhosts/:endpointId/operations", function* (ctx, next) {
  const { type } = ctx.payload;
  const body = {
    type,
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();
});

export const deprovisionEndpoint = api.post<
  { id: string },
  DeployOperationResponse
>("/vhosts/:id/operations", function* (ctx, next) {
  const body = {
    type: "deprovision",
  };
  ctx.request = ctx.req({ body: JSON.stringify(body) });
  yield* next();
  if (!ctx.json.ok) {
    return;
  }

  ctx.loader = { meta: { opId: ctx.json.data.id } };
});

export const provisionEndpoint = thunks.create<CreateEndpointProps>(
  "provision-endpoint",
  function* (ctx, next) {
    yield put(setLoaderStart({ id: ctx.key }));

    let certId = "";
    if (ctx.payload.type === "managed" || ctx.payload.type === "custom") {
      certId = ctx.payload.certId;

      if (!certId && ctx.payload.cert && ctx.payload.privKey) {
        const certCtx = yield* call(
          createCertificate.run,
          createCertificate({
            envId: ctx.payload.envId,
            cert: ctx.payload.cert,
            privKey: ctx.payload.privKey,
          }),
        );
        if (!certCtx.json.ok) {
          yield* put(
            setLoaderError({ id: ctx.key, message: certCtx.json.data.message }),
          );
          return;
        }

        certId = `${certCtx.json.data.id}`;
      }
    }

    const endpointCtx = yield* call(
      createEndpoint.run,
      createEndpoint({ ...ctx.payload, certId }),
    );

    if (!endpointCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: endpointCtx.json.data.message }),
      );
      return;
    }

    yield* next();

    const opCtx = yield* call(
      createEndpointOperation.run,
      createEndpointOperation({
        endpointId: `${endpointCtx.json.data.id}`,
        type: "provision",
      }),
    );

    if (!opCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: opCtx.json.data.message }),
      );
      return;
    }

    ctx.json = {
      endpointCtx,
      opCtx,
    };
    yield* put(
      setLoaderSuccess({
        id: ctx.key,
        meta: {
          endpointId: endpointCtx.json.data.id,
          opId: opCtx.json.data.id,
        },
      }),
    );
  },
);

export const provisionDatabaseEndpoint = thunks.create<CreateDbEndpointProps>(
  "provision-db-endpoint",
  function* (ctx, next) {
    yield put(setLoaderStart({ id: ctx.key }));

    const endpointCtx = yield* call(
      createDatabaseEndpoint.run,
      createDatabaseEndpoint(ctx.payload),
    );

    if (!endpointCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: endpointCtx.json.data.message }),
      );
      return;
    }

    yield* next();

    const opCtx = yield* call(
      createEndpointOperation.run,
      createEndpointOperation({
        endpointId: `${endpointCtx.json.data.id}`,
        type: "provision",
      }),
    );

    if (!opCtx.json.ok) {
      yield* put(
        setLoaderError({ id: ctx.key, message: opCtx.json.data.message }),
      );
      return;
    }

    ctx.json = {
      endpointCtx,
      opCtx,
    };
    yield* put(
      setLoaderSuccess({
        id: ctx.key,
        meta: {
          endpointId: endpointCtx.json.data.id,
          opId: opCtx.json.data.id,
        },
      }),
    );
  },
);

export const renewEndpoint = api.post<{ id: string }, DeployOperationResponse>(
  ["/vhosts/:id/operations", "renew"],
  function* (ctx, next) {
    const body = {
      type: "renew",
    };
    ctx.request = ctx.req({ body: JSON.stringify(body) });
    yield* next();
    if (!ctx.json.ok) {
      return;
    }

    ctx.loader = { meta: { opId: ctx.json.data.id } };
  },
);

interface EndpointPatchProps {
  id: string;
  ipAllowlist: string[];
  containerPort: string;
  certId: string;
}

export interface EndpointUpdateProps extends EndpointPatchProps {
  cert?: string;
  privKey?: string;
  envId: string;
}

const patchEndpoint = api.patch<EndpointPatchProps>(
  "/vhosts/:id",
  function* (ctx, next) {
    const env = yield* select(selectEnv);
    const data: Record<string, any> = {
      ip_whitelist: ctx.payload.ipAllowlist,
      container_port: ctx.payload.containerPort,
    };
    if (ctx.payload.certId) {
      data.certificate = `${env.apiUrl}/certificates/${ctx.payload.certId}`;
    }
    console.log(data);
    const body = JSON.stringify(data);
    ctx.request = ctx.req({ body });

    yield* next();
  },
);

export const updateEndpoint = thunks.create<EndpointUpdateProps>(
  "update-endpoint",
  function* (ctx, next) {
    const id = ctx.name;
    yield* put(setLoaderStart({ id }));

    let certId = ctx.payload.certId;
    if (!certId && ctx.payload.cert && ctx.payload.privKey) {
      const certCtx = yield* call(
        createCertificate.run,
        createCertificate({
          envId: ctx.payload.envId,
          cert: ctx.payload.cert,
          privKey: ctx.payload.privKey,
        }),
      );
      if (!certCtx.json.ok) {
        yield* put(
          setLoaderError({ id: ctx.key, message: certCtx.json.data.message }),
        );
        return;
      }

      certId = `${certCtx.json.data.id}`;
    }

    const patchCtx = yield* call(
      patchEndpoint.run,
      patchEndpoint({
        id: ctx.payload.id,
        ipAllowlist: ctx.payload.ipAllowlist,
        containerPort: ctx.payload.containerPort,
        certId,
      }),
    );
    if (!patchCtx.json.ok) {
      yield* put(setLoaderError({ id, message: patchCtx.json.data.message }));
      return;
    }

    const opCtx = yield* call(
      createEndpointOperation.run,
      createEndpointOperation({
        endpointId: ctx.payload.id,
        type: "provision",
      }),
    );

    if (!opCtx.json.ok) {
      yield* put(setLoaderError({ id, message: opCtx.json.data.message }));
      return;
    }

    yield* put(setLoaderSuccess({ id, meta: { opId: opCtx.json.data.id } }));
    yield* next();
  },
);

export function requiresAcmeSetup(enp: DeployEndpoint) {
  return enp.acme && enp.acmeStatus !== "ready" && enp.status === "provisioned";
}

function ensureTrailingPeriod(name: string) {
  if (name[name.length - 1] === ".") {
    return name;
  }
  return `${name}.`;
}

interface DnsAnswer {
  data: string;
}

export const checkDns = thunks.create<{ from: string; to: string }>(
  "check-dns",
  function* (ctx, next) {
    const { from, to } = ctx.payload;
    yield* put(setLoaderStart({ id: ctx.key }));
    // we add a random number to the google request so the browser
    // doesn't cache the response
    const rand = Math.floor(Math.random() * 10000);
    const resp = yield* call(
      fetch,
      `https://dns.google.com/resolve?rand=${rand}&name=${ensureTrailingPeriod(
        from,
      )}`,
    );
    const data: { Status: number; Answer: DnsAnswer[] } = yield* call([
      resp,
      "json",
    ]);

    let success = false;
    const answers: DnsAnswer[] = data.Answer || [];

    if (data.Status !== 0) {
      yield* put(setLoaderSuccess({ id: ctx.key, meta: { success } }));
    }

    success = answers.some((answer) => {
      return ensureTrailingPeriod(answer.data) === ensureTrailingPeriod(to);
    });

    yield* put(setLoaderSuccess({ id: ctx.key, meta: { success } }));
    yield* next();
  },
);

export const getPlacement = (enp: DeployEndpoint) => {
  if (enp.internal) {
    return "Private";
  }

  return "Public";
};

export const getIpAllowlistText = (enp: DeployEndpoint) => {
  return enp.ipWhitelist.length > 0 ? enp.ipWhitelist.join(", ") : "Disabled";
};

export const isRequiresCert = (enp: DeployEndpoint) => {
  const isHttp = enp.type === "http" || enp.type === "http_proxy_protocol";
  const isTls = enp.type === "tls";
  // https://github.com/aptible/deploy-ui/blob/1342a430ac6849b38eeaa64cdb94ada1754b26fd/app/models/vhost.js#L47
  return (isHttp || isTls) && !enp.default && !enp.acme;
};

export const getContainerPort = (
  enp: Pick<DeployEndpoint, "containerPort">,
  exposedPorts: number[],
) => {
  let port = "Unknown";
  if (exposedPorts.length > 0) {
    const ports = [...exposedPorts].sort();
    port = `${ports[0]}`;
  }
  return enp.containerPort || `Default (${port})`;
};

export const getEndpointUrl = (enp?: DeployEndpoint) => {
  if (!enp) return "";

  if (!hasDeployEndpoint(enp)) {
    return enp.id;
  }

  if (enp.status === "provisioning") {
    return "Provisioning";
  }

  if (enp.type === "tcp") {
    return enp.externalHost;
  }

  return `https://${enp.virtualDomain}`;
};

export const getEndpointText = (enp: DeployEndpoint) => {
  return {
    url: getEndpointUrl(enp),
    placement: getPlacement(enp),
    ipAllowlist: getIpAllowlistText(enp),
  };
};

export const parseIpStr = (ips: string) => {
  return ips.split(/\s+/).filter(Boolean);
};

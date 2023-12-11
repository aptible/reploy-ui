import { api } from "@app/api";
import { defaultEntity, defaultHalHref, extractIdFromLink } from "@app/hal";
import {
  createReducerMap,
  createTable,
  mustSelectEntity,
} from "@app/slice-helpers";
import { TextVal } from "@app/string-utils";
import {
  AppState,
  DeployApp,
  DeployAppConfig,
  DeployAppConfigEnv,
  DeployDatabase,
  LinkResponse,
  MapEntity,
} from "@app/types";
import { createSelector } from "@reduxjs/toolkit";
import { findAppById, selectApps } from "../app";
import { selectDatabasesAsList } from "../database";
import { getEndpointUrl, selectEndpointsAsList } from "../endpoint";
import { findServiceById, selectServices } from "../service";
import { selectDeploy } from "../slice";

export interface DeployConfigurationResponse {
  id: number;
  env: { [key: string]: string | number | boolean };
  _links: {
    resource: LinkResponse;
  };
  _type: "configuration";
}

export const defaultConfigurationResponse = (
  c: Partial<DeployConfigurationResponse> = {},
): DeployConfigurationResponse => {
  return {
    id: 0,
    env: {},
    _links: {
      resource: defaultHalHref(),
    },
    _type: "configuration",
    ...c,
  };
};

export const deserializeAppConfig = (
  resp: DeployConfigurationResponse,
): DeployAppConfig => {
  return {
    id: `${resp.id}`,
    env: resp.env,
    appId: extractIdFromLink(resp._links.resource),
  };
};

export const defaultDeployAppConfig = (
  a: Partial<DeployAppConfig> = {},
): DeployAppConfig => {
  return {
    id: "",
    env: {},
    appId: "",
    ...a,
  };
};

export const configEnvToStr = (env: DeployAppConfigEnv) => {
  return Object.keys(env).reduce((acc, key) => {
    const value = env[key];
    const prev = acc ? `${acc}\n` : "";
    return `${prev}${key}=${value}`;
  }, "");
};

export const prepareConfigEnv = (cur: DeployAppConfigEnv, next: TextVal[]) => {
  const env: { [key: string]: any } = {};
  // the way to "remove" env vars from config is to set them as empty
  // so we do that here
  Object.keys(cur).forEach((key) => {
    env[key] = "";
  });

  next.forEach((e) => {
    env[e.key] = e.value;
  });

  return env;
};

export const APP_CONFIG_NAME = "appConfigs";
const slice = createTable<DeployAppConfig>({ name: APP_CONFIG_NAME });
export const { add: addDeployAppConfigs } = slice.actions;
const initAppConfig = defaultDeployAppConfig();
const must = mustSelectEntity(initAppConfig);
const selectors = slice.getSelectors(
  (s: AppState) => selectDeploy(s)[APP_CONFIG_NAME],
);
export const selectAppConfigById = must(selectors.selectById);

interface DepNodeDb {
  type: "db";
  key: string;
  value: string;
  refId: string;
}

interface DepNodeApp {
  type: "app";
  key: string;
  value: string;
}

export type DepNode = DepNodeApp | DepNodeDb;

const dbRe = new RegExp(/(\d+)\.aptible\.in\:/);
function createDepGraph(env: DeployAppConfigEnv): DepNode[] {
  const deps: DepNode[] = [];
  Object.keys(env).forEach((key) => {
    const value = env[key];
    if (typeof value !== "string") return;
    if (value.includes("aptible.in")) {
      const match = dbRe.exec(value);
      if (match && match.length > 1) {
        deps.push({ key, value, refId: match[1], type: "db" });
      }
    } else if (value.includes("https://")) {
      deps.push({ key, value, type: "app" });
    }
  });
  return deps;
}

export interface DepGraphDb extends DeployDatabase {
  why: DepNode;
}

export const selectDepGraphDatabases = createSelector(
  selectAppConfigById,
  selectDatabasesAsList,
  selectEndpointsAsList,
  (config, dbs) => {
    const graphDbs: MapEntity<DepGraphDb> = {};
    const graph = createDepGraph(config.env);

    for (let i = 0; i < graph.length; i += 1) {
      const node = graph[i];
      const found = dbs.find((db) => {
        if (node.type !== "db") {
          return false;
        }
        return node.refId === db.id;
      });
      if (found) {
        graphDbs[found.id] = { ...found, why: node };
      }
    }

    return Object.values(graphDbs);
  },
);

export interface DepGraphApp extends DeployApp {
  why: DepNode;
}

export const selectDepGraphApps = createSelector(
  selectAppConfigById,
  selectEndpointsAsList,
  selectServices,
  selectApps,
  (config, enps, services, apps) => {
    const graphApps: MapEntity<DepGraphApp> = {};
    const graph = createDepGraph(config.env);

    for (let i = 0; i < graph.length; i += 1) {
      const node = graph[i];
      const found = enps.find((enp) => {
        const url = getEndpointUrl(enp);
        if (node.type !== "app") {
          return;
        }
        return node.value === url;
      });
      if (found) {
        const service = findServiceById(services, { id: found.serviceId });
        const app = findAppById(apps, { id: service.appId });
        graphApps[app.id] = { ...app, why: node };
      }
    }

    return Object.values(graphApps);
  },
);

export const appConfigReducers = createReducerMap(slice);

export const fetchConfiguration = api.get<
  { id: string },
  DeployConfigurationResponse
>("/configurations/:id");

export const appConfigEntities = {
  configuration: defaultEntity({
    id: "configuration",
    deserialize: deserializeAppConfig,
    save: addDeployAppConfigs,
  }),
};

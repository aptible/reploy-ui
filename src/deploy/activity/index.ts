import { createSelector } from "@reduxjs/toolkit";

import { findAppById, selectApps } from "../app";
import { findDatabaseById, selectDatabases } from "../database";
import { findEndpointById, getEndpointUrl, selectEndpoints } from "../endpoint";
import {
  findEnvById,
  hasDeployEnvironment,
  selectEnvironmentsByOrg,
} from "../environment";
import { selectOperationById, selectOperationsAsList } from "../operation";
import type { AppState, DeployOperation } from "@app/types";

export interface DeployActivityRow extends DeployOperation {
  envHandle: string;
  resourceHandle: string;
}

const selectActivityForTable = createSelector(
  selectOperationsAsList,
  selectEnvironmentsByOrg,
  selectDatabases,
  selectApps,
  (ops, envs, dbs, apps) =>
    ops
      .filter((op) => {
        const env = findEnvById(envs, { id: op.environmentId });
        return hasDeployEnvironment(env);
      })
      .map((op): DeployActivityRow => {
        const env = findEnvById(envs, { id: op.environmentId });
        let resourceHandle = "";
        if (op.resourceType === "app") {
          const app = findAppById(apps, { id: op.resourceId });
          resourceHandle = app.handle;
        } else if (op.resourceType === "database") {
          const db = findDatabaseById(dbs, { id: op.resourceId });
          resourceHandle = db.handle;
        } else {
          resourceHandle = op.resourceId;
        }

        return { ...op, envHandle: env.handle, resourceHandle };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
);

const MAX_RESULTS = 50;
// TODO: remove `slice`
export const selectActivityForTableSearch = createSelector(
  selectActivityForTable,
  (_: AppState, props: { search: string }) => props.search.toLocaleLowerCase(),
  (_: AppState, props: { envId?: string }) => props.envId || "",
  (_: AppState, props: { resourceIds?: string[] }) => props.resourceIds || "",
  (ops, search, envId, resourceIds): DeployActivityRow[] => {
    if (search === "" && envId === "" && resourceIds.length === 0) {
      return ops.slice(0, Math.min(ops.length, MAX_RESULTS));
    }

    const filtered = ops.filter((op) => {
      const opType = op.type.toLocaleLowerCase();
      const status = op.status.toLocaleLowerCase();
      const user = op.userName.toLocaleLowerCase();
      const email = op.userEmail.toLocaleLowerCase();
      const envHandle = op.envHandle.toLocaleLowerCase();
      const resource = op.resourceType.toLocaleLowerCase();
      const resourceHandle = op.resourceHandle.toLocaleLowerCase();
      const id = op.id.toLocaleLowerCase();

      const envMatch =
        search !== "" && envHandle !== "" && envHandle.includes(search);
      const userEmailMatch = search !== "" && email.includes(search);
      const userMatch = search !== "" && user.includes(search);
      const opTypeMatch = search !== "" && opType.includes(search);
      const opStatusMatch = search !== "" && status.includes(search);
      const resourceMatch = search !== "" && resource.includes(search);
      const idMatch = search !== "" && id.includes(search);
      const resourceHandleMatch =
        search !== "" &&
        resourceHandle !== "" &&
        resourceHandle.includes(search);
      const searchMatch =
        idMatch ||
        envMatch ||
        userEmailMatch ||
        opTypeMatch ||
        opStatusMatch ||
        userMatch ||
        resourceMatch ||
        resourceHandleMatch;

      const resourceIdMatch =
        resourceIds.length !== 0 && resourceIds.includes(op.resourceId);
      const envIdMatch = envId !== "" && op.environmentId === envId;

      if (resourceIds.length !== 0) {
        if (search !== "") {
          return resourceIdMatch && searchMatch;
        }

        return resourceIdMatch;
      }

      if (envId !== "") {
        if (search !== "") {
          return envIdMatch && searchMatch;
        }

        return envIdMatch;
      }

      return searchMatch;
    });

    return filtered.slice(0, Math.min(ops.length, MAX_RESULTS));
  },
);

export const selectResourceNameByOperationId = createSelector(
  selectOperationById,
  selectDatabases,
  selectApps,
  selectEndpoints,
  (op, dbs, apps, enps) => {
    let resourceHandle = "";
    if (op.resourceType === "app") {
      const app = findAppById(apps, { id: op.resourceId });
      resourceHandle = app.handle;
    } else if (op.resourceType === "database") {
      const db = findDatabaseById(dbs, { id: op.resourceId });
      resourceHandle = db.handle;
    } else if (op.resourceType === "vhost") {
      const enp = findEndpointById(enps, { id: op.resourceId });
      resourceHandle = getEndpointUrl(enp);
    } else {
      resourceHandle = op.resourceId;
    }

    return resourceHandle;
  },
);

import { useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";

import { environmentsUrl } from "@app/routes";

import {
  Box,
  Button,
  DetailPageHeaderView,
  IconExternalLink,
  TabItem,
  tokens,
} from "../shared";

import { MenuWrappedPage } from "./menu-wrapped-page";
import { timeAgo } from "@app/date";
import {
  fetchEnvironmentById,
  fetchEnvironmentOperations,
  selectEndpointsByEnvironmentId,
  selectEnvironmentById,
  selectLatestSuccessDeployOpByEnvId,
  selectStackById,
} from "@app/deploy";
import { capitalize } from "@app/string-utils";
import {
  AppState,
  DeployEndpoint,
  DeployEnvironment,
  DeployOperation,
  DeployStack,
} from "@app/types";
import cn from "classnames";
import { useQuery } from "saga-query/react";

const environmentDetailBox = ({
  environment,
  latestOperation,
  stack,
  endpoints,
}: {
  environment: DeployEnvironment;
  latestOperation: DeployOperation;
  stack: DeployStack;
  endpoints: DeployEndpoint[];
}): React.ReactElement => {
  const userName =
    latestOperation.userName.length >= 15
      ? `${latestOperation.userName.slice(0, 15)}...`
      : latestOperation.userName;
  return (
    <div className={cn(tokens.layout["main width"], "py-6 -mt-5 -mb-5")}>
      <Box>
        <div className="flex items-center justify-between">
          <div className="flex">
            <img
              src={"/logo-environment.png"}
              className="w-8 h-8 mr-3"
              aria-label="Environment"
            />
            <h1 className="text-lg text-gray-500">Environment Details</h1>
          </div>
          <Button className="flex ml-auto" variant="white" size="sm">
            View Docs
            <IconExternalLink className="inline ml-3 h-5 mt-0" />
          </Button>
        </div>
        <div className="flex w-1/1">
          <div className="flex-col w-1/3">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">ID</h3>
              <p>{environment.id}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">Stack</h3>
              <p>{stack.name}</p>
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                Last Deployed
              </h3>
              <p>
                {timeAgo(latestOperation.createdAt)} by {capitalize(userName)}
              </p>
            </div>
          </div>
          <div className="flex-col w-1/3">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                {environment.totalAppCount} App
                {environment.totalAppCount > 0 && "s"}
              </h3>
              Using {environment.appContainerCount} container
              {environment.appContainerCount > 0 && "s"}
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                {environment.totalDatabaseCount} Database
                {environment.totalDatabaseCount > 0 && "s"}
              </h3>
              {environment.databaseContainerCount} container
              {environment.databaseContainerCount > 0 && "s"} using{" "}
              {environment.totalDiskSize} GB of disk
            </div>
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">
                {endpoints.length} Endpoint
                {environment.totalAppCount > 0 && "s"}
              </h3>
              {endpoints.map((endpoint) =>
                endpoint.type === "tcp" ? (
                  endpoint.externalHost
                ) : (
                  <p>
                    <a
                      href={`https://${endpoint.virtualDomain}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {endpoint.virtualDomain}
                    </a>
                  </p>
                ),
              )}
            </div>
          </div>
          <div className="flex-col w-1/3">
            <div className="mt-4">
              <h3 className="text-base font-semibold text-gray-900">Backups</h3>
              {environment.totalBackupSize} GB
            </div>
          </div>
        </div>
      </Box>
    </div>
  );
};

function EnvironmentPageHeader(): React.ReactElement {
  const { id = "" } = useParams();
  useQuery(fetchEnvironmentById({ id }));
  useQuery(fetchEnvironmentOperations({ id }));

  const latestOperation = useSelector((s: AppState) =>
    selectLatestSuccessDeployOpByEnvId(s, { envId: id }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id }),
  );
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: environment.stackId }),
  );
  const endpoints = useSelector((s: AppState) =>
    selectEndpointsByEnvironmentId(s, { envId: environment.id }),
  );
  const crumbs = [{ name: stack.name, to: environmentsUrl() }];

  const tabs = [
    { name: "Resources", href: `/environments/${id}/resources` },
    { name: "Integrations", href: `/environments/${id}/integrations` },
    { name: "Certificates", href: `/environments/${id}/certificates` },
    { name: "Activity", href: `/environments/${id}/activity` },
    { name: "Backups", href: `/environments/${id}/backups` },
    { name: "Settings", href: `/environments/${id}/settings` },
  ] as TabItem[];

  return (
    <DetailPageHeaderView
      breadcrumbs={crumbs}
      detailsBox={environmentDetailBox({
        endpoints,
        environment,
        latestOperation,
        stack,
      })}
      title={environment ? environment.handle : "Loading..."}
      tabs={tabs}
    />
  );
}

export const EnvironmentDetailLayout = () => {
  return (
    <>
      <MenuWrappedPage header={<EnvironmentPageHeader />}>
        <Outlet />
      </MenuWrappedPage>
    </>
  );
};

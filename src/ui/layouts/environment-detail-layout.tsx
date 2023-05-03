import { useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";

import { environmentsUrl } from "@app/routes";

import {
  Box,
  Button,
  DetailPageHeaderView,
  IconExternalLink,
  TabItem,
} from "../shared";

import { DetailPageLayout } from "./detail-page";
import {
  selectEndpointsByEnvironmentId,
  selectEnvironmentById,
  selectStackById,
} from "@app/deploy";
import {
  AppState,
  DeployEndpoint,
  DeployEnvironment,
  DeployStack,
} from "@app/types";

const environmentDetailBox = ({
  environment,
  stack,
  endpoints,
}: {
  environment: DeployEnvironment;
  stack: DeployStack;
  endpoints: DeployEndpoint[];
}): React.ReactElement => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full py-6 -mt-5 -mb-5">
    <Box>
      <Button className="flex ml-auto" variant="white">
        View Docs
        <IconExternalLink className="inline ml-3 h-5 mt-0" />
      </Button>
      <h1 className="text-md text-gray-500 -mt-10">App Details</h1>
      <div className="flex w-1/1">
        <div className="flex-col w-1/4">
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Mode</h3>
            <p>{environment.type === "development" ? "Debug" : "Production"}</p>
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Stack</h3>
            <p>{stack.name}</p>
          </div>
        </div>
        <div className="flex-col w-1/4">
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
        </div>
        <div className="flex-col w-1/4">
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">
              {environment.totalAppCount} App
              {environment.totalAppCount > 0 && "s"}
            </h3>
            Using {environment.appContainerCount} container
            {environment.appContainerCount > 0 && "s"}
          </div>
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">Backups</h3>
            {environment.totalBackupSize} GB
          </div>
        </div>
        <div className="flex-col w-1/4">
          <div className="mt-4">
            <h3 className="text-base font-semibold text-gray-900">
              {endpoints.length} Endpoint{environment.totalAppCount > 0 && "s"}
            </h3>
            {endpoints.map((endpoint) =>
              endpoint.type === "tcp" ? (
                endpoint.externalHost
              ) : (
                <p>
                  <a
                    className="text-blue-500"
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
      </div>
    </Box>
  </div>
);

function EnvironmentPageHeader(): React.ReactElement {
  const { id = "" } = useParams();
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
      <DetailPageLayout header={<EnvironmentPageHeader />}>
        <Outlet />
      </DetailPageLayout>
    </>
  );
};

import { IconInfo } from "../icons";
import { Tooltip } from "../tooltip";
import { useLoader, useQuery } from "@app/fx";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import { prettyDateRelative } from "@app/date";
import {
  DeployAppRow,
  calcServiceMetrics,
  fetchAllApps,
  fetchAllEnvironments,
  fetchEnvironmentById,
  selectAppsForTableSearch,
  selectAppsForTableSearchByEnvironmentId,
} from "@app/deploy";
import { selectServicesByIds } from "@app/deploy";
import { calcMetrics } from "@app/deploy";
import { appServicesUrl, operationDetailUrl } from "@app/routes";
import type { AppState, DeployApp } from "@app/types";

import { EmptyResourcesTable } from "../empty-resources-table";
import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { OpStatus } from "../op-status";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { EnvStackCell } from "../resource-table";
import { Header, TableHead, Td } from "../table";
import { tokens } from "../tokens";
import { capitalize } from "@app/string-utils";

interface AppCellProps {
  app: DeployAppRow;
}

export const AppItemView = ({ app }: { app: DeployApp }) => {
  return (
    <Link to={appServicesUrl(app.id)} className="flex">
      <img
        src="/resource-types/logo-app.png"
        className="w-8 h-8 mr-2 align-middle"
        aria-label="App"
      />
      <p className={`${tokens.type["table link"]} leading-8`}>{app.handle}</p>
    </Link>
  );
};

const AppPrimaryCell = ({ app }: AppCellProps) => {
  return (
    <Td className="flex-1">
      <AppItemView app={app} />
    </Td>
  );
};

const AppServicesCell = ({ app }: AppCellProps) => {
  const services = useSelector((s: AppState) =>
    selectServicesByIds(s, { ids: app.serviceIds }),
  );
  const metrics = calcMetrics(services);
  return (
    <Td>
      <div
        className={tokens.type.darker}
      >{`${app.serviceIds.length} Services`}</div>
      <div className={tokens.type["normal lighter"]}>
        {metrics.totalMemoryLimit / 1024} GB &middot; {metrics.totalCPU} CPU
      </div>
    </Td>
  );
};

const AppCostCell = ({ app }: AppCellProps) => {
  const services = useSelector((s: AppState) =>
    selectServicesByIds(s, { ids: app.serviceIds }),
  );
  const cost = services.reduce((acc, service) => {
    const mm = calcServiceMetrics(service);
    return acc + mm.estimatedCostInDollars;
  }, 0);

  return (
    <Td>
      <div className={tokens.type.darker}>
        {cost.toLocaleString("en", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        })}
      </div>
    </Td>
  );
};

const AppLastOpCell = ({ app }: AppCellProps) => {
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      {app.lastOperation ? (
        <>
          <div className={tokens.type.darker}>
            <Link
              to={operationDetailUrl(app.lastOperation.id)}
              className={tokens.type["table link"]}
            >
              {capitalize(app.lastOperation.type)} by{" "}
              {app.lastOperation.userName}
            </Link>
          </div>
          <div className={tokens.type.darker} />
          <div className={tokens.type["normal lighter"]}>
            <OpStatus status={app.lastOperation.status} />{" "}
            {prettyDateRelative(app.lastOperation.createdAt)}
          </div>
        </>
      ) : (
        <div className={tokens.type["normal lighter"]}>No activity</div>
      )}
    </Td>
  );
};

const AppListRow = ({ app }: AppCellProps) => {
  return (
    <tr className="group hover:bg-gray-50">
      <AppPrimaryCell app={app} />
      <EnvStackCell environmentId={app.environmentId} />
      <AppServicesCell app={app} />
      <AppCostCell app={app} />
      <AppLastOpCell app={app} />
    </tr>
  );
};

const appHeaders: Header[] = [
  "Handle",
  "Environment",
  "Services",
  "Estimated Monthly Cost",
  "Last Operation",
];

const AppList = ({
  apps,
  headerTitleBar,
}: {
  apps: DeployAppRow[];
  headerTitleBar: React.ReactNode;
}) => {
  return (
    <ResourceListView
      header={headerTitleBar}
      tableHeader={<TableHead headers={appHeaders} />}
      tableBody={
        <>
          {apps.map((app) => (
            <AppListRow app={app} key={app.id} />
          ))}
        </>
      }
    />
  );
};

type HeaderTypes =
  | {
      resourceHeaderType: "title-bar";
      onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
    }
  | { resourceHeaderType: "simple-text"; onChange?: null };

const AppsResourceHeaderTitleBar = ({
  apps,
  search = "",
  resourceHeaderType,
  onChange,
}: {
  apps: DeployAppRow[];
  search?: string;
} & HeaderTypes) => {
  switch (resourceHeaderType) {
    case "title-bar":
      return (
        <ResourceHeader
          title="Apps"
          filterBar={
            <div className="pt-1">
              <InputSearch
                placeholder="Search apps..."
                search={search}
                onChange={onChange}
              />
              <div className="flex">
                <p className="flex text-gray-500 mt-4 text-base">
                  {apps.length} App{apps.length !== 1 && "s"}
                </p>
                <div className="mt-4">
                  <Tooltip
                    fluid
                    text="Apps are how you deploy your code, scale services, and manage endpoints."
                  >
                    <IconInfo className="h-5 mt-0.5 opacity-50 hover:opacity-100" />
                  </Tooltip>
                </div>
              </div>
            </div>
          }
        />
      );
    case "simple-text":
      return (
        <p className="flex text-gray-500 text-base mb-4">
          {apps.length} App{apps.length !== 1 && "s"}
        </p>
      );
    default:
      return null;
  }
};

export const AppListByOrg = () => {
  const query = useQuery(fetchAllApps());
  useQuery(fetchAllEnvironments());

  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value });
  };
  const apps = useSelector((s: AppState) =>
    selectAppsForTableSearch(s, { search }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={appHeaders}
          titleBar={
            <AppsResourceHeaderTitleBar
              apps={apps}
              search={search}
              resourceHeaderType="title-bar"
              onChange={onChange}
            />
          }
        />
      }
      query={query}
      isEmpty={apps.length === 0 && search === ""}
    >
      <AppList
        apps={apps}
        headerTitleBar={
          <AppsResourceHeaderTitleBar
            apps={apps}
            search={search}
            resourceHeaderType="title-bar"
            onChange={onChange}
          />
        }
      />
    </LoadResources>
  );
};

export const AppListByEnvironment = ({
  environmentId,
}: {
  environmentId: string;
}) => {
  const loader = useLoader(fetchAllApps());
  useQuery(fetchEnvironmentById({ id: environmentId }));

  const apps = useSelector((s: AppState) =>
    selectAppsForTableSearchByEnvironmentId(s, {
      envId: environmentId,
      search: "",
    }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={appHeaders}
          titleBar={
            <AppsResourceHeaderTitleBar
              apps={apps}
              resourceHeaderType="simple-text"
            />
          }
        />
      }
      query={loader}
      isEmpty={apps.length === 0}
    >
      <AppList
        apps={apps}
        headerTitleBar={
          <AppsResourceHeaderTitleBar
            apps={apps}
            resourceHeaderType="simple-text"
          />
        }
      />
    </LoadResources>
  );
};

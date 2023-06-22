import { useParams } from "react-router";
import { useQuery } from "saga-query/react";

import {
  InputSearch,
  LoadResources,
  Pill,
  ResourceHeader,
  ResourceListView,
  TableHead,
  Td,
  pillStyles,
  tokens,
} from "../shared";
import { EmptyResourcesTable } from "../shared/empty-resources-table";
import {
  fetchLogDrains,
  fetchMetricDrains,
  selectLogDrainsByEnvId,
  selectMetricDrainsByEnvId,
} from "@app/deploy";
import { capitalize } from "@app/string-utils";
import { AppState, DeployLogDrain, DeployMetricDrain } from "@app/types";
import { useSelector } from "react-redux";

const DrainStatusPill = ({
  drain,
}: { drain: DeployLogDrain | DeployMetricDrain }) => {
  let pillClass = pillStyles.progress;
  if (
    drain.status === "pending" ||
    drain.status === "provisioning" ||
    drain.status === "deprovisioning"
  ) {
    pillClass = pillStyles.pending;
  }
  if (drain.status === "provisioned") {
    pillClass = pillStyles.success;
  }
  if (
    drain.status === "deprovision_failed" ||
    drain.status === "provision_failed"
  ) {
    pillClass = pillStyles.error;
  }

  return <Pill className={pillClass}>{capitalize(drain.status)}</Pill>;
};

const LogDrainPrimaryCell = ({ logDrain }: { logDrain: DeployLogDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <DrainStatusPill drain={logDrain} />
        </p>
      </div>
    </Td>
  );
};

const LogDrainHandleCell = ({ logDrain }: { logDrain: DeployLogDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>{logDrain.handle}</span>
          <br />
          <span className={tokens.type["small lighter"]}>
            {capitalize(logDrain.drainType.replace("_", " "))}
          </span>
        </p>
      </div>
    </Td>
  );
};

const LogDrainDestinationCell = ({
  logDrain,
}: { logDrain: DeployLogDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>{logDrain.drainHost}</span>
        </p>
      </div>
    </Td>
  );
};

const LogDrainSourcesCell = ({ logDrain }: { logDrain: DeployLogDrain }) => {
  const drainSources = [];
  if (logDrain.drainApps) {
    drainSources.push("Apps");
  }
  if (logDrain.drainDatabases) {
    drainSources.push("Databases");
  }
  if (logDrain.drainEphemeralSessions) {
    drainSources.push("SSH Sessions");
  }
  if (logDrain.drainProxies) {
    drainSources.push("Proxies");
  }

  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>
            {drainSources.length > 0 ? drainSources.join(", ") : "N/A"}
          </span>
        </p>
      </div>
    </Td>
  );
};

const logDrainsHeaders = ["Status", "Handle", "Destination", "Sources"];

const LogDrainsResourceHeaderTitleBar = ({
  logDrains,
  resourceHeaderType = "title-bar",
  search = "",
  searchOverride = "",
  onChange,
}: {
  logDrains: DeployLogDrain[];
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  search?: string;
  searchOverride?: string;
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  switch (resourceHeaderType) {
    case "hidden":
      return null;
    case "title-bar":
      return (
        <ResourceHeader
          title="Log Drains"
          filterBar={
            <div className="pt-1">
              {searchOverride ? undefined : (
                <InputSearch
                  placeholder="Search log drains..."
                  search={search}
                  onChange={() => {}}
                />
              )}
              <p className="flex text-gray-500 mt-4 text-base">
                {logDrains.length} Log Drain
                {logDrains.length !== 1 && "s"}
              </p>
            </div>
          }
        />
      );
    case "simple-text":
      return (
        <p className="flex text-gray-500 text-base">
          {logDrains.length} Log Drain{logDrains.length !== 1 && "s"}
        </p>
      );
    default:
      return null;
  }
};

const LogDrainsSection = ({ id }: { id: string }) => {
  const query = useQuery(fetchLogDrains({ id }));

  const logDrains = useSelector((s: AppState) =>
    selectLogDrainsByEnvId(s, { envId: id }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={logDrainsHeaders}
          titleBar={
            <LogDrainsResourceHeaderTitleBar
              logDrains={logDrains}
              resourceHeaderType="title-bar"
            />
          }
        />
      }
      query={query}
      isEmpty={logDrains.length === 0}
    >
      <ResourceListView
        header={
          <LogDrainsResourceHeaderTitleBar
            logDrains={logDrains}
            resourceHeaderType="simple-text"
          />
        }
        tableHeader={<TableHead headers={logDrainsHeaders} />}
        tableBody={
          <>
            {logDrains.map((logDrain) => (
              <tr key={logDrain.id}>
                <LogDrainPrimaryCell logDrain={logDrain} />
                <LogDrainHandleCell logDrain={logDrain} />
                <LogDrainDestinationCell logDrain={logDrain} />
                <LogDrainSourcesCell logDrain={logDrain} />
              </tr>
            ))}
          </>
        }
      />
    </LoadResources>
  );
};

const MetricDrainPrimaryCell = ({
  metricDrain,
}: { metricDrain: DeployMetricDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <DrainStatusPill drain={metricDrain} />
        </p>
      </div>
    </Td>
  );
};

const MetricDrainHandleCell = ({
  metricDrain,
}: { metricDrain: DeployMetricDrain }) => {
  return (
    <Td className="flex-1">
      <div className="flex">
        <p className="leading-4">
          <span className={tokens.type.darker}>{metricDrain.handle}</span>
          <br />
          <span className={tokens.type["small lighter"]}>
            {metricDrain.drainType}
          </span>
        </p>
      </div>
    </Td>
  );
};

const metricDrainsHeaders = ["Status", "Handle"];

const MetricDrainsResourceHeaderTitleBar = ({
  metricDrains,
  resourceHeaderType = "title-bar",
  search = "",
  searchOverride = "",
  onChange,
}: {
  metricDrains: DeployMetricDrain[];
  resourceHeaderType?: "title-bar" | "simple-text" | "hidden";
  search?: string;
  searchOverride?: string;
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  switch (resourceHeaderType) {
    case "hidden":
      return null;
    case "title-bar":
      return (
        <ResourceHeader
          title="Metric Drains"
          filterBar={
            <div className="pt-1">
              {searchOverride ? undefined : (
                <InputSearch
                  placeholder="Search metric drains..."
                  search={search}
                  onChange={() => {}}
                />
              )}
              <p className="flex text-gray-500 mt-4 text-base">
                {metricDrains.length} Metric Drain
                {metricDrains.length !== 1 && "s"}
              </p>
            </div>
          }
        />
      );
    case "simple-text":
      return (
        <p className="flex text-gray-500 text-base">
          {metricDrains.length} Metric Drain{metricDrains.length !== 1 && "s"}
        </p>
      );
    default:
      return null;
  }
};

const MetricDrainsSection = ({ id }: { id: string }) => {
  const query = useQuery(fetchMetricDrains({ id }));

  const metricDrains = useSelector((s: AppState) =>
    selectMetricDrainsByEnvId(s, { envId: id }),
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable
          headers={metricDrainsHeaders}
          titleBar={
            <MetricDrainsResourceHeaderTitleBar
              metricDrains={metricDrains}
              resourceHeaderType="title-bar"
            />
          }
        />
      }
      query={query}
      isEmpty={metricDrains.length === 0}
    >
      <ResourceListView
        header={
          <MetricDrainsResourceHeaderTitleBar
            metricDrains={metricDrains}
            resourceHeaderType="simple-text"
          />
        }
        tableHeader={<TableHead headers={metricDrainsHeaders} />}
        tableBody={
          <>
            {metricDrains.map((metricDrain) => (
              <tr key={metricDrain.id}>
                <MetricDrainPrimaryCell metricDrain={metricDrain} />
                <MetricDrainHandleCell metricDrain={metricDrain} />
              </tr>
            ))}
          </>
        }
      />
    </LoadResources>
  );
};

export const EnvironmentIntegrationsPage = () => {
  const { id = "" } = useParams();

  return (
    <>
      <LogDrainsSection id={id} />
      <MetricDrainsSection id={id} />
    </>
  );
};

import { Link } from "react-router-dom";
import { useQuery } from "saga-query/react";

import {
  fetchAllEnvironments,
  selectAppsByEnvId,
  selectDatabasesByEnvId,
  selectEnvironmentsForTableSearch,
  selectStackById,
} from "@app/deploy";
import { environmentResourcelUrl } from "@app/routes";
import type { AppState, DeployEnvironment } from "@app/types";

import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";
import { prettyEnglishDate, timeAgo } from "@app/date";
import { selectLatestSuccessDeployOpByEnvId } from "@app/deploy/operation";
import { capitalize } from "@app/string-utils";
import { useState } from "react";
import { useSelector } from "react-redux";

interface EnvironmentCellProps {
  environment: DeployEnvironment;
}

const EnvironmentPrimaryCell = ({ environment }: EnvironmentCellProps) => {
  return (
    <Td>
      <Link to={environmentResourcelUrl(environment.id)} className="flex">
        <img
          src="/logo-environment.png"
          className="w-8 h-8 mt-1 mr-2"
          aria-label="Environment"
        />
        <p className="leading-4 mt-0">
          <span className={tokens.type["table link"]}>
            {environment.handle}
          </span>
          <br />
          <span className={tokens.type["normal lighter"]}>
            {environment.type === "development" ? "Development" : "Production"}
          </span>
        </p>
      </Link>
    </Td>
  );
};

const EnvironmentDatabasesCell = ({ environment }: EnvironmentCellProps) => {
  const dbs = useSelector((s: AppState) =>
    selectDatabasesByEnvId(s, { envId: environment.id }),
  );
  return (
    <Td className="center items-center justify-center">
      <div className="text-center">{dbs.length}</div>
    </Td>
  );
};

const EnvironmentAppsCell = ({ environment }: EnvironmentCellProps) => {
  const apps = useSelector((s: AppState) =>
    selectAppsByEnvId(s, { envId: environment.id }),
  );
  return (
    <Td className="center items-center justify-center">
      <div className="text-center">{apps.length}</div>
    </Td>
  );
};

const EnvironmentLastDeployedCell = ({ environment }: EnvironmentCellProps) => {
  const operation = useSelector((s: AppState) =>
    selectLatestSuccessDeployOpByEnvId(s, { envId: environment.id }),
  );
  const userName =
    operation.userName.length >= 15
      ? `${operation.userName.slice(0, 15)}...`
      : operation.userName;
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      <div
        className={tokens.type.darker}
        style={{ textTransform: "capitalize" }}
      >
        {prettyEnglishDate(operation.createdAt)}
      </div>
      <div>
        {timeAgo(operation.createdAt)} by {capitalize(userName)}
      </div>
    </Td>
  );
};

const EnvironmentStackCell = ({ environment }: EnvironmentCellProps) => {
  const stack = useSelector((s: AppState) =>
    selectStackById(s, { id: environment.stackId }),
  );

  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      <div>
        <div className="text-black">{stack.name}</div>
        <div className={tokens.type["normal lighter"]}>
          {stack.organizationId ? "Dedicated Stack " : "Shared Stack "}(
          {stack.region})
        </div>
      </div>
    </Td>
  );
};

const EnvironmentListRow = ({ environment }: EnvironmentCellProps) => {
  return (
    <tr>
      <EnvironmentPrimaryCell environment={environment} />
      <EnvironmentStackCell environment={environment} />
      <EnvironmentLastDeployedCell environment={environment} />
      <EnvironmentAppsCell environment={environment} />
      <EnvironmentDatabasesCell environment={environment} />
    </tr>
  );
};

export function EnvironmentList() {
  const query = useQuery(fetchAllEnvironments());

  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const environments = useSelector((s: AppState) =>
    selectEnvironmentsForTableSearch(s, { search }),
  );

  return (
    <LoadResources
      query={query}
      isEmpty={environments.length === 0 && search === ""}
    >
      <ResourceListView
        header={
          <ResourceHeader
            title="Environments"
            filterBar={
              <InputSearch
                placeholder="Search environments..."
                search={search}
                onChange={onChange}
              />
            }
          />
        }
        tableHeader={
          <TableHead
            headers={[
              "Environment",
              "Stack",
              "Last Deployed",
              "Apps",
              "Databases",
            ]}
            rightAlignedFinalCol
            leftAlignedFirstCol
            centerAlignedColIndices={[3, 4]}
          />
        }
        tableBody={
          <>
            {environments.map((environment) => (
              <EnvironmentListRow
                environment={environment}
                key={environment.id}
              />
            ))}
          </>
        }
      />
    </LoadResources>
  );
}

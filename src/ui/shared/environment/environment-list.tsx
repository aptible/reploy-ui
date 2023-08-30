import {
  fetchAllEnvironments,
  selectAppsByEnvId,
  selectDatabasesByEnvId,
  selectEnvironmentsForTableSearch,
  selectStackById,
} from "@app/deploy";
import { useQuery } from "@app/fx";
import {
  createProjectGitUrl,
  environmentAppsUrl,
  stackDetailEnvsUrl,
} from "@app/routes";
import type { AppState, DeployEnvironment } from "@app/types";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { IconInfo, IconPlusCircle } from "../icons";
import { Tooltip } from "../tooltip";

import { prettyEnglishDate, timeAgo } from "@app/date";
import { selectLatestSuccessDeployOpByEnvId } from "@app/deploy/operation";
import { capitalize } from "@app/string-utils";
import { useSelector } from "react-redux";
import { ButtonIcon } from "../button";
import { EmptyResourcesTable } from "../empty-resources-table";
import { InputSearch } from "../input";
import { LoadResources } from "../load-resources";
import { ResourceHeader, ResourceListView } from "../resource-list-view";
import { TableHead, Td } from "../table";
import { tokens } from "../tokens";

interface EnvironmentCellProps {
  environment: DeployEnvironment;
}

export const EnvironmentItemView = ({
  environment,
}: { environment: DeployEnvironment }) => {
  return (
    <Link to={environmentAppsUrl(environment.id)} className="flex">
      <img
        src="/resource-types/logo-environment.png"
        className="w-8 h-8 mr-2 align-middle"
        aria-label="Environment"
      />
      <p className={`${tokens.type["table link"]} leading-8`}>
        {environment.handle}
      </p>
    </Link>
  );
};

const EnvironmentPrimaryCell = ({ environment }: EnvironmentCellProps) => {
  return (
    <Td>
      <EnvironmentItemView environment={environment} />
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
  const userName = operation.userName.slice(0, 15);
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
        <div className="text-black">
          <Link
            to={stackDetailEnvsUrl(stack.id)}
            className={tokens.type["table link"]}
          >
            {stack.name}
          </Link>
        </div>
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
    <tr className="group hover:bg-gray-50">
      <EnvironmentPrimaryCell environment={environment} />
      <EnvironmentStackCell environment={environment} />
      <EnvironmentLastDeployedCell environment={environment} />
      <EnvironmentAppsCell environment={environment} />
      <EnvironmentDatabasesCell environment={environment} />
    </tr>
  );
};

const EnvsResourceHeaderTitleBar = ({
  envs,
  search = "",
  onChange,
  showTitle = true,
  stackId = "",
}: {
  envs: DeployEnvironment[];
  search?: string;
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => void;
  showTitle?: boolean;
  stackId?: string;
}) => {
  const navigate = useNavigate();
  const onCreate = () => {
    navigate(createProjectGitUrl(stackId ? `stack_id=${stackId}` : ""));
  };
  return (
    <ResourceHeader
      title={showTitle ? "Environments" : ""}
      actions={[
        <ButtonIcon icon={<IconPlusCircle variant="sm" />} onClick={onCreate}>
          New Environment
        </ButtonIcon>,
      ]}
      filterBar={
        <div className="pt-1">
          <InputSearch
            placeholder="Search environments..."
            search={search}
            onChange={onChange}
          />

          <div className="flex items-center gap-1 text-gray-500 mt-4 text-base">
            <span>
              {envs.length} Environment{envs.length !== 1 && "s"}
            </span>
            <Tooltip
              fluid
              text="Environments are how you separate resources like staging and production."
            >
              <IconInfo className="opacity-50 hover:opacity-100" variant="sm" />
            </Tooltip>
          </div>
        </div>
      }
    />
  );
};
const environmentHeaders = [
  "Environment",
  "Stack",
  "Last Deployed",
  "Apps",
  "Databases",
];

export function EnvironmentListByStack({ stackId }: { stackId: string }) {
  const query = useQuery(fetchAllEnvironments());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value });
  };

  const environments = useSelector((s: AppState) =>
    selectEnvironmentsForTableSearch(s, { search, stackId }),
  );

  return (
    <LoadResources
      query={query}
      isEmpty={environments.length === 0 && search === ""}
    >
      <ResourceListView
        header={
          <EnvsResourceHeaderTitleBar
            stackId={stackId}
            search={search}
            envs={environments}
            onChange={onChange}
            showTitle={false}
          />
        }
        tableHeader={
          <TableHead
            headers={environmentHeaders}
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
export function EnvironmentList() {
  const query = useQuery(fetchAllEnvironments());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value });
  };

  const environments = useSelector((s: AppState) =>
    selectEnvironmentsForTableSearch(s, { search }),
  );

  const titleBar = (
    <EnvsResourceHeaderTitleBar
      envs={environments}
      search={search}
      onChange={onChange}
    />
  );

  return (
    <LoadResources
      empty={
        <EmptyResourcesTable headers={environmentHeaders} titleBar={titleBar} />
      }
      query={query}
      isEmpty={environments.length === 0 && search === ""}
    >
      <ResourceListView
        header={titleBar}
        tableHeader={
          <TableHead
            headers={environmentHeaders}
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

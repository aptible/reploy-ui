import { ReactElement, useMemo } from "react";
import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import { useLoader, useQuery } from "saga-query/react";

import { prettyDateRelative } from "@app/date";
import {
  DeployActivityRow,
  cancelAppOpsPoll,
  cancelDatabaseOpsPoll,
  cancelEnvOperationsPoll,
  cancelOrgOperationsPoll,
  fetchApp,
  fetchDatabase,
  fetchEnvironmentById,
  getResourceUrl,
  pollAppOperations,
  pollDatabaseOperations,
  pollEnvOperations,
  pollOrgOperations,
  prettyResourceType,
  selectActivityForTableSearch,
  selectAppById,
  selectDatabaseById,
} from "@app/deploy";
import { operationDetailUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { AppState, ResourceType } from "@app/types";

import { usePoller } from "../hooks/use-poller";
import { Button } from "./button";
import { IconRefresh } from "./icons";
import { InputSearch } from "./input";
import { LoadResources } from "./load-resources";
import { OpStatus } from "./op-status";
import { ResourceHeader, ResourceListView } from "./resource-list-view";
import { EnvStackCell } from "./resource-table";
import { TableHead, Td } from "./table";
import { tokens } from "./tokens";

interface OpCellProps {
  op: DeployActivityRow;
}

const getImageForResourceType = (resourceType: ResourceType) => {
  const imageToUse = `/logo-${resourceType}.png`;
  if (!["app", "database"].includes(resourceType)) {
    return null;
  }

  return (
    <img
      src={imageToUse}
      className="w-8 h-8 mr-2 mt-2 align-middle"
      aria-label={resourceType}
    />
  );
};

const OpTypeCell = ({ op }: OpCellProps) => {
  return (
    <Td className="flex-1">
      <Link
        to={operationDetailUrl(op.id)}
        className={tokens.type["table link"]}
      >
        {capitalize(op.type)}
      </Link>
    </Td>
  );
};

const OpStatusCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <OpStatus status={op.status} />
    </Td>
  );
};

const OpResourceCell = ({ op }: OpCellProps) => {
  const url = getResourceUrl(op);
  return (
    <Td>
      <div className="flex">
        {getImageForResourceType(op.resourceType)}
        <div>
          {url ? (
            <Link to={url} className={tokens.type["table link"]}>
              {op.resourceHandle}
            </Link>
          ) : (
            <div>{op.resourceHandle}</div>
          )}
          <div>{prettyResourceType(op.resourceType)}</div>
        </div>
      </div>
    </Td>
  );
};

const OpActionsCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <div>
        <Link to={operationDetailUrl(op.id)} className="hover:no-underline">
          <Button variant="white" color="white" size="sm" className="px-0">
            Logs
          </Button>
        </Link>
      </div>
    </Td>
  );
};

const OpLastUpdatedCell = ({ op }: OpCellProps) => {
  return (
    <Td>
      <div>{capitalize(prettyDateRelative(op.updatedAt))}</div>
    </Td>
  );
};

const OpUserCell = ({ op }: OpCellProps) => {
  return <Td>{op.userName}</Td>;
};

const OpListRow = ({ op }: OpCellProps) => {
  return (
    <tr>
      <OpResourceCell op={op} />
      <OpStatusCell op={op} />
      <OpTypeCell op={op} />
      <EnvStackCell environmentId={op.environmentId} />
      <OpUserCell op={op} />
      <OpLastUpdatedCell op={op} />
      <OpActionsCell op={op} />
    </tr>
  );
};

function ActivityTable({
  ops,
  search,
  isLoading,
  onChange,
  title = "",
  description = "",
}: {
  ops: DeployActivityRow[];
  search: string;
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title?: string;
  description?: string;
}) {
  const resourceHeaderTitleBar = (): ReactElement | undefined => {
    return (
      <ResourceHeader
        title={title}
        description={description}
        filterBar={
          <div className="flex items-center gap-3">
            <InputSearch
              placeholder="Search operations..."
              search={search}
              onChange={onChange}
            />
            {isLoading ? (
              <div className="animate-spin-slow 5s">
                <IconRefresh
                  color="#111920"
                  style={{ width: 14, height: 14 }}
                />
              </div>
            ) : null}
          </div>
        }
      />
    );
  };

  return (
    <div className="my-4">
      <ResourceListView
        header={resourceHeaderTitleBar()}
        tableHeader={
          <TableHead
            headers={[
              "Resource",
              "Status",
              "Operation Type",
              "Environment",
              "User",
              "Last Updated",
              "Actions",
            ]}
          />
        }
        tableBody={
          <>
            {ops.map((op) => (
              <OpListRow op={op} key={op.id} />
            ))}
          </>
        }
      />
    </div>
  );
}

export function ActivityByOrg({ orgId }: { orgId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollOrgOperations);

  const poller = useMemo(() => pollOrgOperations({ orgId }), [orgId]);
  const cancel = useMemo(() => cancelOrgOperationsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });

  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
    }),
  );

  return (
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
        title="Activity"
        description="Realtime dashboard of your organization's operations in the last week."
      />
    </LoadResources>
  );
}

export function ActivityByEnv({ envId }: { envId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollEnvOperations);
  useQuery(fetchEnvironmentById({ id: envId }));

  const poller = useMemo(() => pollEnvOperations({ envId }), [envId]);
  const cancel = useMemo(() => cancelEnvOperationsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });

  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
      envId,
    }),
  );

  return (
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
      />
    </LoadResources>
  );
}

export function ActivityByApp({ appId }: { appId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollAppOperations);
  const app = useSelector((s: AppState) => selectAppById(s, { id: appId }));
  useQuery(fetchEnvironmentById({ id: app.environmentId }));
  useQuery(fetchApp({ id: appId }));

  const poller = useMemo(() => pollAppOperations({ id: appId }), [appId]);
  const cancel = useMemo(() => cancelAppOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });

  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
      resourceId: appId,
    }),
  );

  return (
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
      />
    </LoadResources>
  );
}

export function ActivityByDatabase({ dbId }: { dbId: string }) {
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const loader = useLoader(pollDatabaseOperations);
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id: dbId }));
  useQuery(fetchEnvironmentById({ id: db.environmentId }));
  useQuery(fetchDatabase({ id: dbId }));

  const poller = useMemo(() => pollDatabaseOperations({ id: dbId }), [dbId]);
  const cancel = useMemo(() => cancelDatabaseOpsPoll(), []);
  usePoller({
    action: poller,
    cancel,
  });

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setParams({ search: ev.currentTarget.value });

  const ops = useSelector((s: AppState) =>
    selectActivityForTableSearch(s, {
      search,
      resourceId: dbId,
    }),
  );

  return (
    <LoadResources query={loader} isEmpty={ops.length === 0 && search === ""}>
      <ActivityTable
        ops={ops}
        onChange={onChange}
        isLoading={loader.isLoading}
        search={search}
      />
    </LoadResources>
  );
}

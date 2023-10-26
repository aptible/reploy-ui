import { prettyEnglishDateWithTime } from "@app/date";
import {
  calcMetrics,
  fetchAllDatabaseImages,
  fetchDatabases,
  fetchDiskById,
  fetchEnvironmentById,
  fetchEnvironments,
  getContainerProfileFromType,
  hourlyAndMonthlyCostsForContainers,
  selectDatabaseImageById,
  selectDatabasesForTableSearch,
  selectDatabasesForTableSearchByEnvironmentId,
  selectDiskById,
  selectLatestOpByDatabaseId,
  selectServiceById,
} from "@app/deploy";
import { formatDatabaseType } from "@app/deploy";
import { useQuery } from "@app/fx";
import {
  databaseDetailUrl,
  databaseScaleUrl,
  environmentCreateDbUrl,
  operationDetailUrl,
} from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { AppState, DeployDatabase } from "@app/types";
import { usePaginate } from "@app/ui/hooks";
import { useSelector } from "react-redux";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, ButtonCreate } from "../button";
import { Group } from "../group";
import { IconPlusCircle } from "../icons";
import { InputSearch } from "../input";
import { OpStatus } from "../op-status";
import {
  ActionBar,
  DescBar,
  FilterBar,
  LoadingBar,
  PaginateBar,
  TitleBar,
} from "../resource-list-view";
import { EnvStackCell } from "../resource-table";
import { EmptyTr, TBody, THead, Table, Td, Th, Tr } from "../table";
import { tokens } from "../tokens";

interface DatabaseCellProps {
  database: DeployDatabase;
}

export const DatabaseItemView = ({
  database,
}: { database: DeployDatabase }) => {
  const image = useSelector((s: AppState) =>
    selectDatabaseImageById(s, { id: database.databaseImageId }),
  );
  return (
    <div className="flex">
      <Link to={databaseDetailUrl(database.id)} className="flex">
        <img
          src={`/database-types/logo-${database.type}.png`}
          className="w-[32px] h-[32px] mr-2 mt-1 align-middle"
          aria-label={`${database.type} Database`}
        />
        <p className="flex flex-col">
          <span className={tokens.type["table link"]}>{database.handle}</span>
          <span className={tokens.type["normal lighter"]}>
            {formatDatabaseType(database.type, image.version)}
          </span>
        </p>
      </Link>
    </div>
  );
};

const DatabasePrimaryCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td className="flex-1">
      <DatabaseItemView database={database} />
    </Td>
  );
};

const DatabaseIdCell = ({ database }: DatabaseCellProps) => {
  return <Td className="flex-1">{database.id}</Td>;
};

const DatabaseCostCell = ({ database }: DatabaseCellProps) => {
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const disk = useSelector((s: AppState) =>
    selectDiskById(s, { id: database.id }),
  );
  const currentContainerProfile = getContainerProfileFromType(
    service.instanceClass,
  );
  const { pricePerMonth: currentPrice } = hourlyAndMonthlyCostsForContainers(
    service.containerCount,
    currentContainerProfile,
    service.containerMemoryLimitMb,
    disk.size,
  );
  return (
    <Td>
      <div className={tokens.type.darker}>${currentPrice}</div>
    </Td>
  );
};

export const LastOpCell = ({ database }: DatabaseCellProps) => {
  const lastOperation = useSelector((s: AppState) =>
    selectLatestOpByDatabaseId(s, { dbId: database.id }),
  );
  return (
    <Td className="2xl:flex-cell-md sm:flex-cell-sm">
      <div className={tokens.type.darker}>
        <Link
          to={operationDetailUrl(lastOperation.id)}
          className={tokens.type["table link"]}
        >
          {capitalize(lastOperation.type)} by {lastOperation.userName}
        </Link>
      </div>
      <div className={tokens.type.darker} />
      <div className={tokens.type["normal lighter"]}>
        <OpStatus status={lastOperation.status} />{" "}
        {prettyEnglishDateWithTime(lastOperation.createdAt)}
      </div>
    </Td>
  );
};

const DatabaseDiskSizeCell = ({ database }: DatabaseCellProps) => {
  const disk = useSelector((s: AppState) =>
    selectDiskById(s, { id: database.diskId }),
  );
  return <Td className="text-gray-900">{disk.size} GB</Td>;
};

const DatabaseContainerSizeCell = ({ database }: DatabaseCellProps) => {
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: database.serviceId }),
  );
  const metrics = calcMetrics([service]);
  useQuery(fetchDiskById({ id: database.diskId }));
  return (
    <Td className="text-gray-900">{metrics.totalMemoryLimit / 1024} GB</Td>
  );
};

const DatabaseActionsCell = ({ database }: DatabaseCellProps) => {
  return (
    <Td>
      <Link
        to={databaseScaleUrl(database.id)}
        className="hover:no-underline flex justify-end mr-4"
      >
        <Button variant="primary" size="sm">
          Scale
        </Button>
      </Link>
    </Td>
  );
};

export const DatabaseListByOrg = () => {
  const { isLoading } = useQuery(fetchDatabases());
  useQuery(fetchEnvironments());
  useQuery(fetchAllDatabaseImages());
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearch(s, {
      search,
    }),
  );
  const paginated = usePaginate(dbs);

  return (
    <Group>
      <Group size="sm">
        <TitleBar description="Databases provide data persistence and are automatically configured and managed.">
          Databases
        </TitleBar>

        <FilterBar>
          <Group variant="horizontal" size="sm" className="items-center">
            <InputSearch
              placeholder="Search..."
              search={search}
              onChange={onChange}
            />
            <LoadingBar isLoading={isLoading} />
          </Group>

          <Group variant="horizontal" size="lg" className="items-center mt-1">
            <DescBar>{paginated.totalItems} Databases</DescBar>
            <PaginateBar {...paginated} />
          </Group>
        </FilterBar>
      </Group>

      <Table>
        <THead>
          <Th>Handle</Th>
          <Th>ID</Th>
          <Th>Environment</Th>
          <Th>Disk Size</Th>
          <Th>Container Size</Th>
          <Th>Est. Monthly Cost</Th>
          <Th>Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={7} /> : null}
          {paginated.data.map((db) => (
            <Tr key={db.id}>
              <DatabasePrimaryCell database={db} />
              <DatabaseIdCell database={db} />
              <EnvStackCell environmentId={db.environmentId} />
              <DatabaseDiskSizeCell database={db} />
              <DatabaseContainerSizeCell database={db} />
              <DatabaseCostCell database={db} />
              <DatabaseActionsCell database={db} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};

export const DatabaseListByEnvironment = ({
  envId,
}: {
  envId: string;
}) => {
  const navigate = useNavigate();
  useQuery(fetchDatabases());
  useQuery(fetchEnvironmentById({ id: envId }));
  const onCreate = () => {
    navigate(environmentCreateDbUrl(envId));
  };
  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value }, { replace: true });
  };
  const dbs = useSelector((s: AppState) =>
    selectDatabasesForTableSearchByEnvironmentId(s, {
      envId,
      search,
    }),
  );
  const paginated = usePaginate(dbs);

  return (
    <Group>
      <FilterBar>
        <div className="flex justify-between">
          <InputSearch
            placeholder="Search..."
            search={search}
            onChange={onChange}
          />

          <ActionBar>
            <ButtonCreate envId={envId} onClick={onCreate}>
              <IconPlusCircle variant="sm" />
              <div className="ml-2">New Database</div>
            </ButtonCreate>
          </ActionBar>
        </div>

        <Group variant="horizontal" size="lg" className="items-center mt-1">
          <DescBar>{paginated.totalItems} Databases</DescBar>
          <PaginateBar {...paginated} />
        </Group>
      </FilterBar>

      <Table>
        <THead>
          <Th>Handle</Th>
          <Th>ID</Th>
          <Th>Disk Size</Th>
          <Th>Container Size</Th>
          <Th>Est. Monthly Cost</Th>
          <Th>Actions</Th>
        </THead>

        <TBody>
          {paginated.data.length === 0 ? <EmptyTr colSpan={6} /> : null}
          {paginated.data.map((db) => (
            <Tr key={db.id}>
              <DatabasePrimaryCell database={db} />
              <DatabaseIdCell database={db} />
              <DatabaseDiskSizeCell database={db} />
              <DatabaseContainerSizeCell database={db} />
              <DatabaseCostCell database={db} />
              <DatabaseActionsCell database={db} />
            </Tr>
          ))}
        </TBody>
      </Table>
    </Group>
  );
};

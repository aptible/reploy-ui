import { useQuery } from "@app/fx";
import { useSelector } from "react-redux";

import {
  fetchAllStacks,
  getStackType,
  selectAppsCountByStack,
  selectDatabasesCountByStack,
  selectEnvironmentsCountByStack,
  selectStacksForTableSearch,
} from "@app/deploy";
import { AppState, DeployStack } from "@app/types";

import { MenuWrappedPage } from "../layouts";
import {
  IconInfo,
  InputSearch,
  LoadResources,
  ResourceHeader,
  ResourceListView,
  StackItemView,
  TableHead,
  Td,
  Tooltip,
} from "../shared";
import { capitalize } from "@app/string-utils";
import { useSearchParams } from "react-router-dom";

export function StacksPage() {
  return (
    <MenuWrappedPage>
      <StackList />
    </MenuWrappedPage>
  );
}

function StackListRow({ stack }: { stack: DeployStack }) {
  const stackType = getStackType(stack);
  const envCount = useSelector((s: AppState) =>
    selectEnvironmentsCountByStack(s, { stackId: stack.id }),
  );
  const appCount = useSelector((s: AppState) =>
    selectAppsCountByStack(s, { stackId: stack.id }),
  );
  const dbCount = useSelector((s: AppState) =>
    selectDatabasesCountByStack(s, { stackId: stack.id }),
  );

  return (
    <tr className="group hover:bg-gray-50">
      <Td>
        <StackItemView stack={stack} />
      </Td>
      <Td>{stack.region}</Td>
      <Td>{capitalize(stackType)}</Td>
      <Td>
        {stack.cpuLimits ? "CPU" : ""}
        {stack.cpuLimits && stack.memoryLimits ? ", " : ""}
        {stack.memoryLimits ? "Memory" : ""}
      </Td>
      <Td className="text-center">{envCount}</Td>
      <Td className="text-center">{appCount}</Td>
      <Td className="text-center">{dbCount}</Td>
    </tr>
  );
}

function StackList() {
  const query = useQuery(fetchAllStacks());

  const [params, setParams] = useSearchParams();
  const search = params.get("search") || "";
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setParams({ search: ev.currentTarget.value });
  };

  const stacks = useSelector((s: AppState) =>
    selectStacksForTableSearch(s, {
      search,
    }),
  );

  return (
    <LoadResources query={query} isEmpty={stacks.length === 0 && search === ""}>
      <ResourceListView
        header={
          <ResourceHeader
            title="Stacks"
            filterBar={
              <div className="pt-1">
                <InputSearch
                  placeholder="Search stacks..."
                  search={search}
                  onChange={onChange}
                />
                <div className="flex">
                  <p className="text-gray-500 mt-4 text-base">
                    {stacks.length} Stack{stacks.length !== 1 && "s"}
                  </p>
                  <div className="mt-4">
                    <Tooltip
                      fluid
                      text="Stacks represent the virtualized infrastructure where resources are deployed."
                    >
                      <IconInfo className="h-5 mt-0.5 opacity-50 hover:opacity-100" />
                    </Tooltip>
                  </div>
                </div>
              </div>
            }
          />
        }
        tableHeader={
          <TableHead
            headers={[
              "Name",
              "Region",
              "Type",
              "Enabled Limits",
              "Environments",
              "Apps",
              "Databases",
            ]}
            centerAlignedColIndices={[4, 5, 6]}
          />
        }
        tableBody={
          <>
            {stacks.map((stack) => (
              <StackListRow stack={stack} key={stack.id} />
            ))}
          </>
        }
      />
    </LoadResources>
  );
}

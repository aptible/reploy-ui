import { selectAppsCountBySource } from "@app/deploy";
import { useSelector } from "@app/react";
import { sourceDetailUrl } from "@app/routes";
import { fetchSources, selectSourcesAsList } from "@app/source";
import { DeploySource } from "@app/types";
import { Link } from "react-router-dom";
import { useQuery } from "starfx/react";
import { usePaginate } from "../hooks";
import { AppSidebarLayout } from "../layouts";
import {
  DescBar,
  EmptyTr,
  FilterBar,
  Group,
  LoadingBar,
  PaginateBar,
  SourceLogo,
  TBody,
  THead,
  Table,
  Td,
  Th,
  TitleBar,
  Tr,
  tokens,
} from "../shared";

function SourceListRow({ source }: { source: DeploySource }) {
  const appCount = useSelector((s) =>
    selectAppsCountBySource(s, { sourceId: source.id }),
  );

  return (
    <Tr key={source.id}>
      <Td>
        <Link to={sourceDetailUrl(source.id)} className="flex items-center">
          <SourceLogo
            source={source}
            className="w-[32px] h-[32px] mr-2 align-middle"
          />
          <p className={`${tokens.type["table link"]} leading-8`}>
            {source.displayName}
          </p>
        </Link>
      </Td>
      <Td variant="center" className="center items-center justify-center">
        <div className="text-center">{appCount}</div>
      </Td>
    </Tr>
  );
}

export function SourcesPage() {
  const { isLoading } = useQuery(fetchSources());
  const sources = useSelector(selectSourcesAsList);
  const paginated = usePaginate(sources);

  return (
    <AppSidebarLayout>
      <Group>
        <Group size="sm">
          <TitleBar description="Sources connect apps with code repositories to show you what's deployed where.">
            Sources
          </TitleBar>

          <FilterBar>
            <Group variant="horizontal" size="sm" className="items-center">
              <LoadingBar isLoading={isLoading} />
            </Group>

            <Group variant="horizontal" size="lg" className="items-center mt-1">
              <DescBar>{paginated.totalItems} Sources</DescBar>
              <PaginateBar {...paginated} />
            </Group>
          </FilterBar>
        </Group>

        <Table>
          <THead>
            <Th>Name</Th>
            <Th variant="center">Apps</Th>
          </THead>

          <TBody>
            {paginated.data.length === 0 ? <EmptyTr colSpan={3} /> : null}
            {paginated.data.map((source) => (
              <SourceListRow source={source} key={source.id} />
            ))}
          </TBody>
        </Table>
      </Group>
    </AppSidebarLayout>
  );
}

import { prettyDateTime } from "@app/date";
import { useQuery, useSelector } from "@app/react";
import { sourceDetailAppsUrl, sourcesUrl } from "@app/routes";
import { fetchSourceById, selectSourceById } from "@app/source";
import { DeploySource } from "@app/types";
import { Outlet, useParams } from "react-router";
import { Link } from "react-router-dom";
import {
  CopyText,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";
import { AppSidebarLayout } from "./app-sidebar-layout";

export function SourceHeader({ source }: { source: DeploySource }) {
  return (
    <DetailHeader>
      <DetailTitleBar
        title="Source Details"
        icon={
          <img
            src="/resource-types/logo-source.png"
            className="w-[32px] h-[32px] mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/apps"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{source.id}</DetailInfoItem>
        <DetailInfoItem title="Name">
          <CopyText text={source.displayName} />
        </DetailInfoItem>
        <DetailInfoItem title="Created">
          {prettyDateTime(source.createdAt)}
        </DetailInfoItem>
        <DetailInfoItem title="Repository URL">
          {(source.url?.match(/^https?:\/\//) && (
            <Link to={source.url} target="_blank">
              <CopyText text={source.url} />
            </Link>
          )) || <CopyText text={source.url} />}
        </DetailInfoItem>
        <DetailInfoItem title="Last Deployed">
          {prettyDateTime(source.createdAt)}
        </DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function SourcePageHeader() {
  const { id = "" } = useParams();
  const loader = useQuery(fetchSourceById({ id }));
  const source = useSelector((s) => selectSourceById(s, { id }));

  const crumbs = [{ name: "Sources", to: sourcesUrl() }];

  const tabs: TabItem[] = [{ name: "Apps", href: sourceDetailAppsUrl(id) }];

  return (
    <DetailPageHeaderView
      {...loader}
      breadcrumbs={crumbs}
      title={source.displayName}
      detailsBox={<SourceHeader source={source} />}
      tabs={tabs}
    />
  );
}

export function SourceDetailLayout() {
  return (
    <AppSidebarLayout header={<SourcePageHeader />}>
      <Outlet />
    </AppSidebarLayout>
  );
}

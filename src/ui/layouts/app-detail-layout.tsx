import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useParams } from "react-router-dom";

import { prettyEnglishDate } from "@app/date";
import {
  cancelAppOpsPoll,
  fetchApp,
  fetchAppServices,
  fetchImageById,
  pollAppOperations,
  selectAppById,
  selectEnvironmentById,
  selectImageById,
  selectLatestDeployOp,
  selectServiceById,
} from "@app/deploy";
import {
  appActivityUrl,
  appEndpointsUrl,
  appServicePathMetricsUrl,
  appServiceScalePathUrl,
  appServicesUrl,
  appSettingsUrl,
  environmentAppsUrl,
} from "@app/routes";
import type { AppState, DeployApp } from "@app/types";

import { usePoller } from "../hooks";
import {
  ActiveOperationNotice,
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  TabItem,
} from "../shared";

import { setResourceStats } from "@app/search";
import { useQuery } from "saga-query/react";
import { MenuWrappedPage } from "./menu-wrapped-page";

export function AppHeader({ app }: { app: DeployApp }) {
  const lastDeployOp = useSelector((s: AppState) =>
    selectLatestDeployOp(s, { appId: app.id }),
  );
  useQuery(fetchImageById({ id: app.currentImageId }));
  const image = useSelector((s: AppState) =>
    selectImageById(s, { id: app.currentImageId }),
  );

  return (
    <DetailHeader>
      <DetailTitleBar
        title="App Details"
        icon={
          <img
            src={"/resource-types/logo-app.png"}
            className="w-8 h-8 mr-3"
            aria-label="App"
          />
        }
        docsUrl="https://www.aptible.com/docs/apps"
      />

      <DetailInfoGrid>
        <DetailInfoItem title="ID">{app.id}</DetailInfoItem>
        <DetailInfoItem title="Git Remote">{app.gitRepo}</DetailInfoItem>
        <div className="hidden md:block" />
        <DetailInfoItem title="Last Deployed">
          {lastDeployOp
            ? `${prettyEnglishDate(lastDeployOp.createdAt)}`
            : "Unknown"}
        </DetailInfoItem>
        <DetailInfoItem title="Docker Image">{image.dockerRepo}</DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

const AppHeartbeatNotice = ({ id }: { id: string; serviceId: string }) => {
  const poller = useMemo(() => pollAppOperations({ id }), [id]);
  const cancel = useMemo(() => cancelAppOpsPoll(), []);

  usePoller({
    action: poller,
    cancel,
  });

  return <ActiveOperationNotice resourceId={id} resourceType="app" />;
};

function AppPageHeader() {
  const { id = "", serviceId = "" } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setResourceStats({ id, type: "app" }));
  }, []);

  const loader = useQuery(fetchApp({ id }));
  useQuery(fetchAppServices({ id: id }));
  const app = useSelector((s: AppState) => selectAppById(s, { id }));
  const service = useSelector((s: AppState) =>
    selectServiceById(s, { id: serviceId }),
  );
  const environment = useSelector((s: AppState) =>
    selectEnvironmentById(s, { id: app.environmentId }),
  );

  const crumbs = [
    { name: environment.handle, to: environmentAppsUrl(environment.id) },
  ];
  if (serviceId) {
    crumbs.push({
      name: app.handle,
      to: appServicesUrl(app.id),
    });
  }

  // TODO - COME BACK TO THIS
  // Need to kick a user back out of the details page (or lock specific pages if it is deleted)
  // currently the network log will error with a 404 (as the record will be deleted)

  const tabs: TabItem[] = serviceId
    ? [
        { name: "Metrics", href: appServicePathMetricsUrl(id, serviceId) },
        { name: "Scale", href: appServiceScalePathUrl(id, serviceId) },
      ]
    : [
        { name: "Services", href: appServicesUrl(id) },
        { name: "Endpoints", href: appEndpointsUrl(id) },
        { name: "Activity", href: appActivityUrl(id) },
        { name: "Settings", href: appSettingsUrl(id) },
      ];

  return (
    <>
      <AppHeartbeatNotice id={id} serviceId={serviceId} />
      <DetailPageHeaderView
        {...loader}
        breadcrumbs={crumbs}
        title={serviceId ? service.handle : app.handle}
        detailsBox={<AppHeader app={app} />}
        tabs={tabs}
      />
    </>
  );
}

export const AppDetailLayout = () => {
  return (
    <MenuWrappedPage header={<AppPageHeader />}>
      <Outlet />
    </MenuWrappedPage>
  );
};

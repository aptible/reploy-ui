import { useSelector } from "react-redux";
import { Link, Outlet, useParams } from "react-router-dom";

import { prettyEnglishDateWithTime } from "@app/date";
import {
  getResourceUrl,
  prettyResourceType,
  selectOperationById,
  selectResourceNameByOperationId,
} from "@app/deploy";
import { activityUrl } from "@app/routes";
import { capitalize } from "@app/string-utils";
import type { AppState, DeployOperation } from "@app/types";

import {
  DetailHeader,
  DetailInfoGrid,
  DetailInfoItem,
  DetailPageHeaderView,
  DetailTitleBar,
  OpStatus,
} from "../shared";

import { MenuWrappedPage } from "./menu-wrapped-page";

export function OpHeader({
  op,
  resourceHandle,
}: { op: DeployOperation; resourceHandle: string }) {
  const url = getResourceUrl(op);

  return (
    <DetailHeader>
      <DetailTitleBar title="Operation Details" />

      <DetailInfoGrid>
        <DetailInfoItem title="Type">{capitalize(op.type)}</DetailInfoItem>
        <DetailInfoItem title="Last Updated">
          {capitalize(prettyEnglishDateWithTime(op.updatedAt))}
        </DetailInfoItem>
        <DetailInfoItem />

        <DetailInfoItem title="Status">
          <OpStatus status={op.status} />
        </DetailInfoItem>
        <DetailInfoItem title="User">{op.userName}</DetailInfoItem>
        <DetailInfoItem />

        <DetailInfoItem>
          <div className="text-base font-semibold text-gray-900">
            {prettyResourceType(op.resourceType)}
          </div>
          {url ? <Link to={url}>{resourceHandle}</Link> : resourceHandle}
        </DetailInfoItem>
        <DetailInfoItem title="Note">{op.note || "N/A"}</DetailInfoItem>
      </DetailInfoGrid>
    </DetailHeader>
  );
}

function OpPageHeader() {
  const { id = "" } = useParams();
  const op = useSelector((s: AppState) => selectOperationById(s, { id }));
  const resourceHandle = useSelector((s: AppState) =>
    selectResourceNameByOperationId(s, { id: op.id }),
  );

  return (
    <DetailPageHeaderView
      breadcrumbs={[{ name: "Activity", to: activityUrl() }]}
      title={`Operation: ${op.id}`}
      detailsBox={<OpHeader op={op} resourceHandle={resourceHandle} />}
    />
  );
}

export const OpDetailLayout = () => {
  return (
    <MenuWrappedPage header={<OpPageHeader />}>
      <Outlet />
    </MenuWrappedPage>
  );
};

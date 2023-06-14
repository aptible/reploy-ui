import { ReactElement, useState } from "react";

import {
  ButtonIcon,
  IconChevronDown,
  IconEllipsis,
  InputSearch,
  LoadResources,
  ResourceListView,
  TableHead,
  Td,
  tokens,
} from "../";
import { prettyEnglishDateWithTime } from "@app/date";
import { BackupResponse } from "@app/deploy";
import { capitalize } from "@app/string-utils";
import cn from "classnames";
import { LoadingState } from "saga-query/*";

const BackupTypePill = ({ manual }: { manual: boolean }): ReactElement => {
  const className = cn(
    "rounded-full border-2",
    "text-sm font-semibold ",
    "px-2 flex justify-between items-center w-fit",
  );

  return (
    <div
      className={cn(
        className,
        manual
          ? "bg-indigo-100 text-indigo-400 border-indigo-300"
          : "bg-lime-100 text-green-400 border-lime-300",
      )}
    >
      <div>{manual ? "Manual" : "Auto"}</div>
    </div>
  );
};

const backupListRow = ({
  backup,
}: {
  backup: BackupResponse;
}): ReactElement => {
  return (
    <tr key={`${backup.id}`}>
      <Td className="flex-1 pl-4">
        <div className={tokens.type.darker}>
          {prettyEnglishDateWithTime(backup.created_at)}
        </div>
        <div className={tokens.type["normal lighter"]}>ID: {backup.id}</div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">{backup.size} GB</div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">{backup.created_by_email}</div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">
          {backup.aws_region
            .split("-")
            .map((s) => capitalize(s))
            .join("-")}
        </div>
      </Td>

      <Td className="flex-1">
        <div className="text-gray-900">
          <BackupTypePill manual={backup.manual} />
        </div>
      </Td>

      <Td className="flex gap-2 justify-end mt-2 mr-4">
        <ButtonIcon
          icon={
            <IconEllipsis className="-mr-2" style={{ width: 16, height: 16 }} />
          }
          type="submit"
          variant="white"
          size="xs"
        />
      </Td>
    </tr>
  );
};

export const DatabaseBackupsList = ({
  backups,
  query,
}: {
  backups: BackupResponse[];
  query: LoadingState;
}) => {
  const [search, setSearch] = useState("");
  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) =>
    setSearch(ev.currentTarget.value);

  const sortIconProps = {
    className: "inline",
    color: "#6b7280",
    style: { width: 14, height: 14 },
  };

  return (
    <LoadResources query={query} isEmpty={backups.length === 0}>
      <div className="mt-4">
        <div className="flex justify-between w-100">
          <div className="flex w-1/2">
            {/* <ButtonIcon icon={<IconPlusCircle />}>New Backup</ButtonIcon> */}
          </div>
          <div className="flex w-1/2 justify-end">
            <InputSearch
              className="self-end float-right]"
              placeholder="Search backups ..."
              search={search}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-4 select-none">
          <div className="ml-5 cursor-pointer inline">
            Older than: <IconChevronDown {...sortIconProps} />
          </div>
          <div className="ml-5 cursor-pointer inline">
            Size: All <IconChevronDown {...sortIconProps} />
          </div>
          <div className="ml-5 cursor-pointer inline">
            Status: All <IconChevronDown {...sortIconProps} />
          </div>
          <div className="ml-5 cursor-pointer inline">
            Region: All <IconChevronDown {...sortIconProps} />
          </div>
          <div className="ml-5 cursor-pointer inline">
            Retention: Manual <IconChevronDown {...sortIconProps} />
          </div>
          <div className="ml-5 cursor-pointer inline">
            Source: Originals <IconChevronDown {...sortIconProps} />
          </div>
        </div>
      </div>
      <div className="my-4">
        <ResourceListView
          tableHeader={
            <TableHead
              rightAlignedFinalCol
              headers={["Time", "Size", "Creator", "Region", "Type", "Actions"]}
            />
          }
          tableBody={<>{backups.map((backup) => backupListRow({ backup }))}</>}
        />
      </div>
    </LoadResources>
  );
};

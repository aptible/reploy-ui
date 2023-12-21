import { createDatabaseOperation, selectDatabaseById } from "@app/deploy";
import { useLoader, useLoaderSuccess } from "@app/fx";
import { databaseActivityUrl, environmentBackupsUrl } from "@app/routes";
import { AppState } from "@app/types";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";
import { usePaginatedBackupsByDatabaseId } from "../hooks";
import {
  BannerMessages,
  ButtonLink,
  ButtonOps,
  DatabaseBackupsList,
  Group,
  IconEdit,
  IconPlusCircle,
} from "../shared";

export const DatabaseBackupsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const paginated = usePaginatedBackupsByDatabaseId(id);
  const db = useSelector((s: AppState) => selectDatabaseById(s, { id }));
  const backupAction = createDatabaseOperation({ type: "backup", dbId: id });
  const loader = useLoader(backupAction);

  const onCreateBackup = () => {
    dispatch(backupAction);
  };

  useLoaderSuccess(loader, () => {
    navigate(databaseActivityUrl(id));
  });

  return (
    <Group>
      <div className="flex gap-4 items-center">
        <ButtonOps
          envId={db.environmentId}
          onClick={onCreateBackup}
          isLoading={loader.isLoading}
        >
          <IconPlusCircle variant="sm" className="mr-2" /> New Backup
        </ButtonOps>

        <ButtonLink
          to={environmentBackupsUrl(db.environmentId)}
          variant="white"
        >
          <IconEdit variant="sm" className="mr-2" /> Edit Environment Backup
          Policy
        </ButtonLink>
      </div>

      <BannerMessages className="my-4" {...loader} />

      <DatabaseBackupsList paginated={paginated} showDatabase={false} />
    </Group>
  );
};

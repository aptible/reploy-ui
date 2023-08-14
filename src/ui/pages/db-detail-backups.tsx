import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router";

import {
  cancelPollDatabaseBackups,
  createDatabaseOperation,
  pollDatabaseBackups,
  selectBackupsByDatabaseId,
  selectDatabaseById,
} from "@app/deploy";
import { useLoader, useLoaderSuccess } from "@app/fx";
import { databaseActivityUrl } from "@app/routes";
import { AppState } from "@app/types";

import { usePoller } from "../hooks";
import {
  BannerMessages,
  ButtonCreate,
  Button,
  DatabaseBackupsList,
  IconPlusCircle,
  IconEdit2,
  LoadingSpinner,
} from "../shared";
import { useMemo } from "react";

export const DatabaseBackupsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const action = useMemo(() => pollDatabaseBackups({ id }), [id]);
  const cancel = useMemo(() => cancelPollDatabaseBackups(), []);
  const pollLoader = useLoader(action);

  usePoller({ action, cancel });

  const backups = useSelector((s: AppState) =>
    selectBackupsByDatabaseId(s, { dbId: id }),
  );
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
    <div>
      <div className="flex gap-4 items-center">
        <ButtonCreate
          envId={db.environmentId}
          onClick={onCreateBackup}
          isLoading={loader.isLoading}
        >
          <IconPlusCircle variant="sm" className="mr-2" /> New Backup
        </ButtonCreate>

        <Button variant="white"><IconEdit2 variant="sm" className="mr-2" /> Edit Backup Policy</Button>

        <LoadingSpinner show={pollLoader.isLoading} />

      </div>

      <BannerMessages className="my-4" {...loader} />

      <DatabaseBackupsList backups={backups} />
    </div>
  );
};

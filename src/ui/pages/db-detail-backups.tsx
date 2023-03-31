import { useEffect } from "react";
import { useParams } from "react-router";
import { useCache } from "saga-query/react";

import type { HalEmbedded } from "@app/types";

import { EmptyResources, Loading } from "../shared";
import { fetchDatabaseBackups, HalBackups } from "@app/deploy";
import { DatabaseBackupsList } from "../shared/db/backup-list";

export const DatabaseBackupsPage = () => {
  const { id = "" } = useParams();
  const query = useCache<HalEmbedded<HalBackups>>(fetchDatabaseBackups({ id }));
  useEffect(() => {
    query.trigger();
  }, []);

  if (query.isInitialLoading) {
    return <Loading />;
  }

  if (!query.data) {
    return <EmptyResources />;
  }

  const { backups } = query.data._embedded;

  return <DatabaseBackupsList query={query} backups={backups} />;
};

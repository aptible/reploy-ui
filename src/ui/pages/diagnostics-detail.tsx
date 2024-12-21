import { diagnosticsCreateUrl, diagnosticsDetailUrl } from "@app/routes";
import { AppSidebarLayout } from "../layouts";
import { Breadcrumbs, LoadingSpinner, Loading } from "../shared";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../shared/button";
import { selectAptibleAiUrl } from "@app/config";
import { useSelector } from "@app/react";
import { selectAccessToken } from "@app/token";

const loadingMessages = [
  "Consulting the tech support crystal ball...",
  "Teaching hamsters to debug code...",
  "Bribing the servers with virtual cookies...",
  "Performing diagnostic interpretive dance...",
  "Teaching the AI to be less artificial and more intelligent..."
];

export const DiagnosticsDetailPage = () => {
  const { id } = useParams();
  const aptibleAiUrl = useSelector(selectAptibleAiUrl);
  const dashboardUrl = `${aptibleAiUrl}/app/dashboards/${id}/`;
  const [messageIndex, setMessageIndex] = useState(0);
  const [isDashboardReady, setIsDashboardReady] = useState(false);
  const accessToken = useSelector(selectAccessToken);

  useEffect(() => {
    const checkDashboard = async () => {
      try {
        // TODO: Figure out how to get a status code from an action, so that we
        // can swap out this fetch implementation.
        const response = await fetch(dashboardUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.ok) {
          setIsDashboardReady(true);
          return true;
        }
      } catch (error) {
        // Ignore errors - we'll try again
      }
      return false;
    };

    let interval: NodeJS.Timeout;

    const initialize = async () => {
      // Check immediately, in case the dashboard has already been created.
      const isReady = await checkDashboard();

      // Only set up the interval if the dashboard isn't ready yet.
      if (!isReady) {
        interval = setInterval(async () => {
          setMessageIndex((current) => (current + 1) % loadingMessages.length);
          const ready = await checkDashboard();
          if (ready) {
            clearInterval(interval);
          }
        }, 3000);
      }
    };

    initialize();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, dashboardUrl, accessToken]);

  return (
    <AppSidebarLayout>
      <Breadcrumbs
        crumbs={[
          {
            name: "Diagnostics",
            to: diagnosticsCreateUrl(),
          },
          {
            name: `${id}`,
            to: diagnosticsDetailUrl(`${id}`)
          },
        ]}
      />

      <div className="flex flex-row items-center justify-center flex-1 min-h-[500px]">
        <div className="scale-150 flex flex-row items-center gap-3">
          {!isDashboardReady ? (
            <>
              <LoadingSpinner />
              <Loading text={loadingMessages[messageIndex]} />
            </>
          ) : (
            <form action={dashboardUrl} method="post">
              <input type="hidden" name="_bearer_token" value={accessToken} />
              <Button type="submit">View Dashboard</Button>
            </form>
          )}
        </div>
      </div>
    </AppSidebarLayout>
  );
};

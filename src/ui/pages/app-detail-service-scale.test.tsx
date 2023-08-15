import { act, fireEvent, render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import {
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testServiceRails,
} from "@app/mocks";
import { APP_SERVICE_SCALE_PATH, appServiceScalePathUrl } from "@app/routes";
import { setupIntegrationTest, waitForToken } from "@app/test";

import { AppDetailServiceScalePage } from "./app-detail-service-scale";

describe("AppDetailServiceScalePage", () => {
  it("should successfully show app service scale page happy path", async () => {
    server.use(
      ...stacksWithResources({ accounts: [testAccount], apps: [testApp] }),
    );
    const { TestProvider, store } = setupIntegrationTest({
      initEntries: [
        appServiceScalePathUrl(`${testApp.id}`, `${testServiceRails.id}`),
      ],
      path: APP_SERVICE_SCALE_PATH,
    });

    await waitForToken(store);

    render(
      <TestProvider>
        <AppDetailServiceScalePage />
      </TestProvider>,
    );

    await screen.findByText(
      /Optimize container performance with a custom profile./,
    );
  });
});

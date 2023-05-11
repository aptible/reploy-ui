import { setupIntegrationTest } from "@app/test";
import { fireEvent, render, screen } from "@testing-library/react";
import { CreateProjectGitStatusPage } from "./create-project-git";
import {
  createId,
  server,
  stacksWithResources,
  testAccount,
  testApp,
  testEnv,
  testServiceRails,
} from "@app/mocks";
import {
  createProjectGitStatusUrl,
  CREATE_PROJECT_GIT_STATUS_PATH,
} from "@app/routes";
import { rest } from "msw";
import { defaultEndpointResponse } from "@app/deploy";
import { defaultHalHref } from "@app/hal";

describe("CreateProjectGitStatusPage", () => {
  describe("when app deployed and no vhost provisioned yet", () => {
    it("should let the user create a vhost", async () => {
      const handlers = stacksWithResources({
        accounts: [testAccount],
        apps: [testApp],
      });
      server.use(...handlers);

      const { TestProvider } = setupIntegrationTest({
        path: CREATE_PROJECT_GIT_STATUS_PATH,
        initEntries: [createProjectGitStatusUrl(`${testApp.id}`)],
      });
      render(
        <TestProvider>
          <CreateProjectGitStatusPage />
        </TestProvider>,
      );

      const txt = await screen.findByText("Which service needs an endpoint?");
      expect(txt).toBeInTheDocument();
      const btn = await screen.findByRole("button", {
        name: "Create endpoint",
      });
      expect(btn).toBeInTheDocument();
      const vhostSelector = await screen.findAllByRole("radio");
      fireEvent.click(vhostSelector[0]);
      fireEvent.click(btn);

      const op = await screen.findByText("HTTPS endpoint provision");
      expect(op).toBeInTheDocument();
    });
  });

  describe("when app deploy and vhost provisioned already", () => {
    it("should show vhosts and a link to manage them", async () => {
      const handlers = stacksWithResources({
        accounts: [testAccount],
        apps: [testApp],
      });
      server.use(
        ...handlers,
        rest.get(`${testEnv.apiUrl}/apps/:id/vhosts`, (_, res, ctx) => {
          const jso = {
            _embedded: {
              vhosts: [
                defaultEndpointResponse({
                  id: createId(),
                  virtual_domain: "https://some.url",
                  _links: {
                    service: defaultHalHref(
                      `${testEnv.apiUrl}/services/${testServiceRails.id}`,
                    ),
                    certificate: defaultHalHref(),
                  },
                }),
              ],
            },
          };
          return res(ctx.json(jso));
        }),
      );

      const { TestProvider } = setupIntegrationTest({
        path: CREATE_PROJECT_GIT_STATUS_PATH,
        initEntries: [createProjectGitStatusUrl(`${testApp.id}`)],
      });
      render(
        <TestProvider>
          <CreateProjectGitStatusPage />
        </TestProvider>,
      );

      const txt = await screen.findByText("Current Endpoints");
      expect(txt).toBeInTheDocument();
      const service = await screen.findByText(testServiceRails.command);
      expect(service).toBeInTheDocument();
      const link = await screen.findByRole("link", {
        name: "Manage Endpoints",
      });
      expect(link).toBeInTheDocument();
    });
  });
});

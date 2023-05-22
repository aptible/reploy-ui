import { SignupPage } from "./signup";
import { setupIntegrationTest } from "@app/test";
import { render, screen } from "@testing-library/react";

describe("Signup page", () => {
  it("the sign up page should render", async () => {
    const { TestProvider } = setupIntegrationTest();
    render(
      <TestProvider>
        <SignupPage />
      </TestProvider>,
    );
    const el = await screen.findByRole("button", { name: "Create Account" });
    expect(el.textContent).toEqual("Create Account");
  });
});

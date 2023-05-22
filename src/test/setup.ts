// https://github.com/vitest-dev/vitest/issues/3077#issuecomment-1484093141
import "whatwg-fetch";

import { server } from "@app/mocks";
import matchers, {
  TestingLibraryMatchers,
} from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { expect } from "vitest";

declare module "vitest" {
  interface JestAssertion<T = any>
    extends jest.Matchers<void, T>,
      TestingLibraryMatchers<T, void> {}
}

expect.extend(matchers);

// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => {
  server.resetHandlers();
  // https://testing-library.com/docs/react-testing-library/api/#cleanup
  cleanup();
});

// Clean up after the tests are finished.
afterAll(() => server.close());

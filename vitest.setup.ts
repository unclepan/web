import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Register jest-dom matchers (toBeInTheDocument, toHaveAttribute, ...) and
// unmount any rendered React components after every test so the DOM stays
// isolated between cases.
afterEach(() => {
  cleanup();
});

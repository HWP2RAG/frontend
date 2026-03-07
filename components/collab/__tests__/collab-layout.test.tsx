import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// Mock LoginButton to avoid hook dependencies
vi.mock("@/components/login-button", () => ({
  LoginButton: () => <div data-testid="login-button">LoginButton</div>,
}));

import CollabLayout from "@/app/collab/layout";

describe("CollabLayout", () => {
  it("renders LoginButton component", () => {
    render(
      <CollabLayout>
        <div>child</div>
      </CollabLayout>
    );
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });

  it('renders "HWPX 협업" label text', () => {
    render(
      <CollabLayout>
        <div>child</div>
      </CollabLayout>
    );
    expect(screen.getByText("HWPX 협업")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <CollabLayout>
        <div data-testid="child-content">Hello World</div>
      </CollabLayout>
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/ui/StatusBadge";

describe("StatusBadge Component", () => {
  it("renders verified status correctly with icon and correct styling", () => {
    render(<StatusBadge status="verified" />);
    const badge = screen.getByRole("status");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Verified");
    expect(badge.querySelector("svg")).toBeInTheDocument();
    expect(badge).toHaveAttribute("aria-label", "Status: Verified");
  });

  it("renders pending status correctly", () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Pending");
    expect(badge.querySelector("svg")).toBeInTheDocument();
  });

  it("renders failed status correctly", () => {
    render(<StatusBadge status="failed" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Failed");
  });

  it("renders employee active status without icon by default (config doesn't have icon)", () => {
    render(<StatusBadge status="active" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Active");
    expect(badge.querySelector("svg")).not.toBeInTheDocument();
  });

  it("hides icon if showIcon={false} is passed", () => {
    render(<StatusBadge status="verified" showIcon={false} />);
    const badge = screen.getByRole("status");
    expect(badge.querySelector("svg")).not.toBeInTheDocument();
  });

  it("falls back gracefully for unknown status", () => {
    render(<StatusBadge status="some_unknown_status_state" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Some Unknown Status State");
    expect(badge.querySelector("svg")).toBeInTheDocument(); // fallback HelpCircle
  });

  it("handles empty or null status safely", () => {
    render(<StatusBadge status="" />);
    const badge = screen.getByRole("status");
    expect(badge).toHaveTextContent("Unknown");
  });
});

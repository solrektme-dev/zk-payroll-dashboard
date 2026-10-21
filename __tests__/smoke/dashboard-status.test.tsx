import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import PayrollSummary from "@/components/features/payroll/PayrollSummary";
import TransactionHistory from "@/components/features/transactions/TransactionHistory";

describe("Smoke: Dashboard Status Visibility", () => {
  it("renders payroll summary cards with live data", () => {
    render(<PayrollSummary />);
    expect(screen.getByText("$124,500")).toBeInTheDocument();
    expect(screen.getByText("48")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows status indicators for payroll health", () => {
    render(<PayrollSummary />);
    expect(screen.getByText("+12% from last month")).toBeInTheDocument();
    expect(screen.getByText("2 new this week")).toBeInTheDocument();
    expect(screen.getByText("Action required")).toBeInTheDocument();
  });

  it("renders transaction history table", async () => {
    render(<TransactionHistory />);
    await waitFor(() => {
      expect(
        screen.getByRole("table", { name: /payroll transactions/i }),
      ).toBeInTheDocument();
    });
  });

  it("shows transaction count", async () => {
    render(<TransactionHistory />);
    await waitFor(() => {
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
    });
  });
});

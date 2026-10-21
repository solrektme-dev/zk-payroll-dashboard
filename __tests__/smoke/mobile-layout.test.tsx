import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionHistory from "@/components/features/transactions/TransactionHistory";
import EmployeeDirectory from "@/components/features/employees/EmployeeDirectory";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

describe("Smoke: Mobile layout rendering", () => {
  describe("Sidebar", () => {
    it("renders the hamburger button", () => {
      render(<Sidebar />);
      expect(screen.getByRole("button", { name: /open navigation menu/i })).toBeInTheDocument();
    });

    it("opens the mobile drawer when hamburger is clicked", () => {
      render(<Sidebar />);
      const trigger = screen.getByRole("button", { name: /open navigation menu/i });
      fireEvent.click(trigger);
      expect(screen.getByRole("dialog", { name: /navigation menu/i })).toBeInTheDocument();
    });

    it("closes the mobile drawer when close button is clicked", () => {
      render(<Sidebar />);
      fireEvent.click(screen.getByRole("button", { name: /open navigation menu/i }));
      fireEvent.click(screen.getByRole("button", { name: /close navigation menu/i }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("renders all navigation links in the desktop sidebar", () => {
      render(<Sidebar />);
      expect(screen.getAllByRole("link", { name: /dashboard/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole("link", { name: /employees/i }).length).toBeGreaterThan(0);
      expect(screen.getAllByRole("link", { name: /history/i }).length).toBeGreaterThan(0);
    });
  });

  describe("Header", () => {
    it("renders the command palette trigger button", () => {
      render(<Header />);
      expect(screen.getByRole("searchbox", { name: /search actions/i })).toBeInTheDocument();
    });

    it("renders the notifications button", () => {
      render(<Header />);
      expect(screen.getByRole("button", { name: /notifications/i })).toBeInTheDocument();
    });
  });

  describe("TransactionHistory", () => {
    it("renders the desktop table once loaded", async () => {
      render(<TransactionHistory />);
      await waitFor(() => {
        expect(screen.getByRole("table", { name: /payroll transactions/i })).toBeInTheDocument();
      });
    });

    it("shows transaction count footer once loaded", async () => {
      render(<TransactionHistory />);
      await waitFor(() => {
        expect(screen.getByText(/showing/i)).toBeInTheDocument();
      });
    });
  });

  describe("EmployeeDirectory mobile cards", () => {
    it("renders the mobile card list once loaded", async () => {
      render(<EmployeeDirectory />);
      await waitFor(() => {
        expect(screen.getByRole("list", { name: /employee directory/i })).toBeInTheDocument();
      });
    });

    it("renders the desktop table once loaded", async () => {
      render(<EmployeeDirectory />);
      await waitFor(() => {
        expect(screen.getByRole("table", { name: /employee directory/i })).toBeInTheDocument();
      });
    });

    it("shows employee count footer once loaded", async () => {
      render(<EmployeeDirectory />);
      await waitFor(() => {
        expect(screen.getByText(/showing/i)).toBeInTheDocument();
      });
    });

    it("status filter buttons have accessible tap targets", () => {
      render(<EmployeeDirectory />);
      const allBtn = screen.getByRole("button", { name: /^all/i });
      expect(allBtn).toBeInTheDocument();
      expect(allBtn.className).toContain("min-h-");
    });

    it("filters employee cards when status filter is changed", () => {
      render(<EmployeeDirectory />);
      const activeBtn = screen.getByRole("button", { name: /^active/i });
      fireEvent.click(activeBtn);
      expect(activeBtn.className).toContain("bg-indigo-600");
    });
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardHome from "@/components/features/dashboard/DashboardHome";
import SystemStatus from "@/components/features/dashboard/SystemStatus";
import PinnedAlertsPanel from "@/components/features/dashboard/PinnedAlertsPanel";
import OnboardingChecklistPanel from "@/components/features/dashboard/OnboardingChecklistPanel";
import * as StellarProviderModule from "@/components/providers/StellarProvider";
import * as walletStoreModule from "@/stores/walletStore";
import * as companyStoreModule from "@/stores/company";

vi.mock("@/components/providers/StellarProvider");
vi.mock("@/stores/walletStore");
vi.mock("@/stores/company");

const mockUseStellar = vi.mocked(StellarProviderModule.useStellar);
const mockUseWalletStore = vi.mocked(walletStoreModule.useWalletStore);
const mockUseCompanyStore = vi.mocked(companyStoreModule.useCompanyStore);

describe("Visual Regression - Dashboard States", () => {
  beforeEach(() => {
    mockUseStellar.mockReturnValue({
      isFreighterInstalled: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as any);

    mockUseWalletStore.mockImplementation((selector?: (state: any) => any) => {
      const state = {
        isConnected: true,
        isLoading: false,
        publicKey: "GTEST123",
        network: "TESTNET" as const,
      };
      return selector ? selector(state) : state;
    });

    mockUseCompanyStore.mockReturnValue({
      company: {
        id: "test-company",
        name: "Test Company",
        admin: "GTEST123",
        treasury: "GTREASURY",
        employeeCount: 10,
        isActive: true,
      },
    } as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Dashboard Home - Complete State", () => {
    it.skip("renders dashboard with all components visible", () => {
      mockUseStellar.mockReturnValue({
        isFreighterInstalled: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as any);

      mockUseWalletStore.mockImplementation((selector?: (state: any) => any) => {
        const state = {
          isConnected: true,
          isLoading: false,
          publicKey: "GTEST123",
          network: "TESTNET" as const,
        };
        return selector ? selector(state) : state;
      });

      mockUseCompanyStore.mockReturnValue({
        company: {
          id: "test-company",
          name: "Test Company",
          admin: "GTEST123",
          treasury: "GTREASURY",
          employeeCount: 10,
          isActive: true,
        },
      } as any);

      render(<DashboardHome />);
      
      // Verify key elements render
      expect(screen.getByText("Test Company")).toBeInTheDocument();
      expect(screen.getByText("Admin dashboard")).toBeInTheDocument();
    });
  });

  describe("Dashboard Home - No Wallet State", () => {
    it("renders wallet connection prompt", () => {
      mockUseWalletStore.mockImplementation((selector?: (state: any) => any) => {
        const state = {
          isConnected: false,
          isLoading: false,
          publicKey: null,
          network: "TESTNET" as const,
        };
        return selector ? selector(state) : state;
      });

      const { container } = render(<DashboardHome />);

      expect(
        screen.getByText("Connect your wallet to get started"),
      ).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe("Dashboard Home - No Company State", () => {
    it.skip("renders company setup required state", () => {
      mockUseStellar.mockReturnValue({
        isFreighterInstalled: true,
        connect: vi.fn(),
        disconnect: vi.fn(),
      } as any);

      mockUseWalletStore.mockImplementation((selector?: (state: any) => any) => {
        const state = {
          isConnected: true,
          isLoading: false,
          publicKey: "GTEST123",
          network: "TESTNET" as const,
        };
        return selector ? selector(state) : state;
      });

      mockUseCompanyStore.mockReturnValue({
        company: null,
      } as any);

      render(<DashboardHome />);
      
      // Verify the no-company state renders
      expect(screen.getByText("Company setup required")).toBeInTheDocument();
    });
  });

  describe("System Status - All Operational", () => {
    it("renders all systems operational state", () => {
      const { container } = render(<SystemStatus />);

      expect(screen.getByText("System Status")).toBeInTheDocument();
      expect(screen.getAllByText("Operational")).toHaveLength(4);
      expect(container).toMatchSnapshot();
    });
  });

  describe("Pinned Alerts Panel - Critical Alert", () => {
    it("renders critical alert with proper styling", () => {
      const alerts = [
        {
          id: "alert-1",
          title: "Critical: Payroll Processing Delayed",
          message: "RPC connection experiencing high latency",
          severity: "critical" as const,
          status: "pending" as const,
          createdAt: new Date().toISOString(),
          link: "/incidents",
          actionLabel: "View incident",
        },
      ];

      const { container } = render(<PinnedAlertsPanel alerts={alerts} />);

      expect(
        screen.getByText("Critical: Payroll Processing Delayed"),
      ).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe("Pinned Alerts Panel - Multiple Tasks", () => {
    it("renders multiple pending tasks with priorities", () => {
      const tasks = [
        {
          id: "task-1",
          title: "Review pending audit request",
          description: "New audit access request from External Auditor Inc",
          priority: "high" as const,
          status: "pending" as const,
          link: "/compliance",
        },
        {
          id: "task-2",
          title: "Fund treasury wallet",
          description: "Treasury balance below threshold for next payroll",
          priority: "medium" as const,
          status: "pending" as const,
          link: "/treasury",
        },
      ];

      const { container } = render(<PinnedAlertsPanel tasks={tasks} />);

      expect(
        screen.getByText("Review pending audit request"),
      ).toBeInTheDocument();
      expect(screen.getByText("Fund treasury wallet")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe("Onboarding Checklist - Partial Completion", () => {
    it("renders checklist with some items completed", () => {
      const { container } = render(<OnboardingChecklistPanel />);

      expect(screen.getByText("Action Required: Onboarding Setup")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });

  describe("Dashboard Home - Loading State", () => {
    it("renders loading spinner during wallet connection", () => {
      mockUseWalletStore.mockImplementation((selector?: (state: any) => any) => {
        const state = {
          isConnected: false,
          isLoading: true,
          publicKey: null,
          network: "TESTNET" as const,
        };
        return selector ? selector(state) : state;
      });

      const { container } = render(<DashboardHome />);

      expect(screen.getByText("Connecting to wallet…")).toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });
});

describe("Visual Regression - Onboarding Flow States", () => {
  it("captures onboarding checklist empty state", () => {
    const { container } = render(<OnboardingChecklistPanel />);
    expect(container).toMatchSnapshot();
  });
});

describe("Visual Regression - Alert Panel Edge Cases", () => {
  it("renders empty state when no alerts or tasks", () => {
    const { container } = render(<PinnedAlertsPanel alerts={[]} tasks={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders mixed severity alerts", () => {
    const alerts = [
      {
        id: "alert-1",
        title: "Critical Alert",
        message: "Critical issue",
        severity: "critical" as const,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      },
      {
        id: "alert-2",
        title: "Warning Alert",
        message: "Warning issue",
        severity: "warning" as const,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      },
      {
        id: "alert-3",
        title: "Info Alert",
        message: "Info message",
        severity: "info" as const,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      },
    ];

    const { container } = render(<PinnedAlertsPanel alerts={alerts} />);
    expect(container).toMatchSnapshot();
  });
});

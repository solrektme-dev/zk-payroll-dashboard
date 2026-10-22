import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";
import { useWalletStore } from "@/stores/walletStore";

// ── Mock Freighter API / Stellar SDK ────────────────────────────────────────
// Mirrors __tests__/network-guard.test.tsx so StellarProvider (imported
// transitively by PayrollWizard) can load without touching the real
// Freighter extension or Soroban RPC.

vi.mock("@stellar/freighter-api", () => ({
  isConnected: vi.fn().mockResolvedValue({ isConnected: false }),
  isAllowed: vi.fn().mockResolvedValue({ isAllowed: false }),
  setAllowed: vi.fn().mockResolvedValue({ isAllowed: false }),
  getAddress: vi.fn().mockResolvedValue({ address: null, error: "not connected" }),
  getNetwork: vi
    .fn()
    .mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network ; September 2015" }),
  signTransaction: vi.fn(),
}));

vi.mock("@stellar/stellar-sdk", () => ({
  Contract: vi.fn(),
  TransactionBuilder: vi.fn().mockImplementation(() => ({
    addOperation: vi.fn().mockReturnThis(),
    setTimeout: vi.fn().mockReturnThis(),
    build: vi.fn().mockReturnValue({ toXDR: () => "mock-xdr" }),
  })),
  BASE_FEE: "100",
}));

vi.mock("@stellar/stellar-sdk/rpc", () => ({
  Api: { isSimulationError: vi.fn().mockReturnValue(false) },
  assembleTransaction: vi.fn().mockReturnValue({ build: () => ({ toXDR: () => "mock-xdr" }) }),
  Server: vi.fn().mockImplementation(() => ({
    getAccount: vi.fn().mockResolvedValue({ accountId: "GXXX", sequence: "0" }),
    simulateTransaction: vi.fn().mockResolvedValue({ result: {} }),
    sendTransaction: vi.fn().mockResolvedValue({ hash: "mock-hash" }),
  })),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

// EXPECTED_NETWORK resolution from NEXT_PUBLIC_STELLAR_NETWORK is covered in
// __tests__/wallet-network-env.test.tsx. This file assumes the default
// (unset env -> TESTNET) and asserts the PayrollWizard warning/blocking UI
// against the real useWalletStore singleton.

describe("Wallet Network Mismatch Detection: PayrollWizard warning and blocking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useWalletStore.getState().reset();
  });

  it("shows a persistent warning banner naming both networks when the wallet is on the wrong network", async () => {
    const PayrollWizard = (await import("@/components/features/payroll/PayrollWizard")).default;

    useWalletStore.setState({ network: "PUBLIC" });

    render(<PayrollWizard />);

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/wallet network mismatch/i);
    expect(alert).toHaveTextContent("PUBLIC");
    expect(alert).toHaveTextContent("TESTNET");
  });

  it("does not show the warning banner when the wallet is on the expected network", async () => {
    const PayrollWizard = (await import("@/components/features/payroll/PayrollWizard")).default;

    useWalletStore.setState({ network: "TESTNET" });

    render(<PayrollWizard />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("disables the Start Payroll Run action while the mismatch exists", async () => {
    const PayrollWizard = (await import("@/components/features/payroll/PayrollWizard")).default;

    useWalletStore.setState({ network: "PUBLIC" });

    render(<PayrollWizard />);

    expect(screen.getByRole("button", { name: /start payroll run/i })).toBeDisabled();
  });

  it("disables Generate Proof while the mismatch exists", async () => {
    const PayrollWizard = (await import("@/components/features/payroll/PayrollWizard")).default;
    const { usePayrollWizardStore } = await import("@/stores/payrollWizard");

    useWalletStore.setState({ network: "PUBLIC" });
    usePayrollWizardStore.setState({
      currentStep: "proof",
      employeeIds: ["emp_001"],
      totalAmount: 1000,
    });

    render(<PayrollWizard />);

    expect(screen.getByRole("button", { name: /generate proof/i })).toBeDisabled();

    usePayrollWizardStore.getState().reset();
  });

  it("recovers correctly after switching to the right network: banner clears and actions re-enable", async () => {
    const PayrollWizard = (await import("@/components/features/payroll/PayrollWizard")).default;

    useWalletStore.setState({ network: "PUBLIC" });

    render(<PayrollWizard />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /start payroll run/i })).toBeDisabled();

    act(() => {
      useWalletStore.setState({ network: "TESTNET" });
    });

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: /start payroll run/i })).not.toBeDisabled();
  });

  it("disables Retry Submission on the submit step while the mismatch exists", async () => {
    const PayrollWizard = (await import("@/components/features/payroll/PayrollWizard")).default;
    const { usePayrollWizardStore } = await import("@/stores/payrollWizard");

    useWalletStore.setState({ network: "TESTNET" });
    usePayrollWizardStore.setState({
      currentStep: "submit",
      employeeIds: ["emp_001", "emp_002"],
      totalAmount: 9500,
      submissionStatus: "error",
      submissionError: "Submission failed: network timeout.",
    });

    render(<PayrollWizard />);

    const retryBtn = screen.getByRole("button", { name: /retry submission/i });
    expect(retryBtn).not.toBeDisabled();

    act(() => {
      useWalletStore.setState({ network: "PUBLIC" });
    });

    await waitFor(() => {
      expect(retryBtn).toBeDisabled();
    });

    usePayrollWizardStore.getState().reset();
  });
});

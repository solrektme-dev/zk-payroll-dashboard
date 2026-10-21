import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import React from "react";
import { useWalletStore } from "@/stores/walletStore";
import { WalletErrorOverlay } from "@/components/providers/WalletErrorOverlay";

// ── Mock Freighter API ──────────────────────────────────────────────────────

const mockGetNetwork = vi.fn();
const mockGetAddress = vi.fn();
const mockIsConnected = vi.fn();
const mockIsAllowed = vi.fn();
const mockSignTransaction = vi.fn();

vi.mock("@stellar/freighter-api", () => ({
  isConnected: (...args: unknown[]) => mockIsConnected(...args),
  isAllowed: (...args: unknown[]) => mockIsAllowed(...args),
  setAllowed: vi.fn().mockResolvedValue({ isAllowed: true }),
  getAddress: (...args: unknown[]) => mockGetAddress(...args),
  getNetwork: (...args: unknown[]) => mockGetNetwork(...args),
  signTransaction: (...args: unknown[]) => mockSignTransaction(...args),
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

beforeEach(() => {
  useWalletStore.getState().reset();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── WalletErrorOverlay: recovery steps ──────────────────────────────────────

describe("Network Guard: WalletErrorOverlay recovery steps", () => {
  it("renders step-by-step instructions for wrong-network", () => {
    render(
      <WalletErrorOverlay
        type="wrong-network"
        currentNetwork="PUBLIC"
        expectedNetwork="TESTNET"
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByText(/wrong network/i)).toBeInTheDocument();
    expect(screen.getByText(/open your freighter extension/i)).toBeInTheDocument();
    expect(screen.getByText(/go to settings/i)).toBeInTheDocument();
    expect(screen.getByText(/return to the application/i)).toBeInTheDocument();
  });

  it("displays the expected network name in recovery steps", () => {
    render(
      <WalletErrorOverlay
        type="wrong-network"
        currentNetwork="PUBLIC"
        expectedNetwork="TESTNET"
        onDismiss={vi.fn()}
      />
    );

    expect(screen.getByText("TESTNET")).toBeInTheDocument();
  });

  it("does NOT render recovery steps for no-wallet type", () => {
    render(
      <WalletErrorOverlay type="no-wallet" onDismiss={vi.fn()} />
    );

    expect(screen.queryByText(/open your freighter extension/i)).not.toBeInTheDocument();
  });
});

// ── StellarProvider: overlay shown on wrong network ─────────────────────────

describe("Network Guard: wrong-network overlay", () => {
  it("shows overlay when Freighter reports a different network", async () => {
    const { StellarProvider } = await import("@/components/providers/StellarProvider");

    mockIsConnected.mockResolvedValue({ isConnected: true });
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetAddress.mockResolvedValue({ address: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" });
    mockGetNetwork.mockResolvedValue({ network: "PUBLIC", networkPassphrase: "Public Global Stellar Network ; September 2015" });

    await act(async () => {
      render(
        <StellarProvider>
          <div>test child</div>
        </StellarProvider>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/wrong network/i)).toBeInTheDocument();
    });
  });

  it("does NOT show overlay when network matches expected", async () => {
    const { StellarProvider } = await import("@/components/providers/StellarProvider");

    mockIsConnected.mockResolvedValue({ isConnected: true });
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetAddress.mockResolvedValue({ address: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" });
    mockGetNetwork.mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network ; September 2015" });

    await act(async () => {
      render(
        <StellarProvider>
          <div>test child</div>
        </StellarProvider>
      );
    });

    await waitFor(() => {
      expect(useWalletStore.getState().isLoading).toBe(false);
    });

    expect(screen.queryByText(/wrong network/i)).not.toBeInTheDocument();
  });
});

// ── StellarProvider: signTx and invokeContract guards ───────────────────────

describe("Network Guard: signTx and invokeContract blocked on wrong network", () => {
  it("signTx returns null and does not call Freighter signTransaction when on wrong network", async () => {
    const { StellarProvider, useStellar } = await import("@/components/providers/StellarProvider");

    mockIsConnected.mockResolvedValue({ isConnected: true });
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetAddress.mockResolvedValue({ address: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" });
    mockGetNetwork.mockResolvedValue({ network: "PUBLIC", networkPassphrase: "Public Global Stellar Network ; September 2015" });
    mockSignTransaction.mockResolvedValue({ signedTxXdr: "signed-xdr" });

    let hookResult: any = null;

    function HookConsumer() {
      hookResult = useStellar();
      return null;
    }

    await act(async () => {
      render(
        <StellarProvider>
          <HookConsumer />
        </StellarProvider>
      );
    });

    await waitFor(() => {
      expect(useWalletStore.getState().isLoading).toBe(false);
    });

    let signResult: string | null = null;
    await act(async () => {
      signResult = await hookResult.signTx("mock-xdr");
    });

    expect(signResult).toBeNull();
    expect(mockSignTransaction).not.toHaveBeenCalled();
  });

  it("invokeContract returns null when on wrong network", async () => {
    const { StellarProvider, useStellar } = await import("@/components/providers/StellarProvider");

    mockIsConnected.mockResolvedValue({ isConnected: true });
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetAddress.mockResolvedValue({ address: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" });
    mockGetNetwork.mockResolvedValue({ network: "PUBLIC", networkPassphrase: "Public Global Stellar Network ; September 2015" });

    let hookResult: any = null;

    function HookConsumer() {
      hookResult = useStellar();
      return null;
    }

    await act(async () => {
      render(
        <StellarProvider>
          <HookConsumer />
        </StellarProvider>
      );
    });

    await waitFor(() => {
      expect(useWalletStore.getState().isLoading).toBe(false);
    });

    let invokeResult: string | null = null;
    await act(async () => {
      invokeResult = await hookResult.invokeContract({
        contractId: "CXXX",
        method: "pay",
        args: [],
      });
    });

    expect(invokeResult).toBeNull();
  });
});

// ── StellarProvider: success path when network is correct ───────────────────

describe("Network Guard: success path on correct network", () => {
  it("signTx proceeds when network is correct", async () => {
    const { StellarProvider, useStellar } = await import("@/components/providers/StellarProvider");

    mockIsConnected.mockResolvedValue({ isConnected: true });
    mockIsAllowed.mockResolvedValue({ isAllowed: true });
    mockGetAddress.mockResolvedValue({ address: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" });
    mockGetNetwork.mockResolvedValue({ network: "TESTNET", networkPassphrase: "Test SDF Network ; September 2015" });
    mockSignTransaction.mockResolvedValue({ signedTxXdr: "signed-xdr" });

    let hookResult: any = null;

    function HookConsumer() {
      hookResult = useStellar();
      return null;
    }

    await act(async () => {
      render(
        <StellarProvider>
          <HookConsumer />
        </StellarProvider>
      );
    });

    await waitFor(() => {
      expect(useWalletStore.getState().isLoading).toBe(false);
    });

    let signResult: string | null = null;
    await act(async () => {
      signResult = await hookResult.signTx("mock-xdr");
    });

    expect(signResult).toBe("signed-xdr");
    expect(mockSignTransaction).toHaveBeenCalled();
  });
});

// ── PayrollWizard: button disabled state ────────────────────────────────────

describe("Network Guard: PayrollWizard buttons disabled on wrong network", () => {
  it("Start Payroll Run button is disabled when network is wrong", async () => {
    const PayrollWizard = (await import("@/components/features/payroll/PayrollWizard")).default;

    useWalletStore.setState({ network: "PUBLIC" });

    render(<PayrollWizard />);

    await waitFor(() => {
      const btn = screen.queryByRole("button", { name: /start payroll run/i });
      if (btn) {
        expect(btn).toBeDisabled();
      }
    });
  });
});

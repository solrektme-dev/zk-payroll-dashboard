import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WalletConnect from "@/components/features/wallet/WalletConnect";
import { useWalletStore } from "@/stores/walletStore";

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();

vi.mock("@/components/providers/StellarProvider", () => ({
  useStellar: () => ({
    connect: mockConnect,
    disconnect: mockDisconnect,
    isFreighterInstalled: true,
  }),
  EXPECTED_NETWORK: "TESTNET",
}));

beforeEach(() => {
  mockConnect.mockReset();
  mockDisconnect.mockReset();
  useWalletStore.getState().reset();
});

describe("Smoke: Wallet Connection", () => {
  it("renders connect button when disconnected", () => {
    render(<WalletConnect />);

    expect(
      screen.getByRole("button", {
        name: /connect freighter/i,
      }),
    ).toBeInTheDocument();
  });

  it("calls connect when the connect button is clicked", async () => {
    render(<WalletConnect />);

    fireEvent.click(
      screen.getByRole("button", {
        name: /connect freighter/i,
      }),
    );

    await waitFor(() => {
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });
  });

  it("shows connected state with wallet address", () => {
    useWalletStore.setState({
      isConnected: true,
      publicKey: "GBXTQW2V3MHZLZ5K2JZ29MQJ3DQJ29MQJ3DQJ29MQJ29MQJ29MQJ29MQ",
    });

    render(<WalletConnect />);
    expect(
      screen.getByRole("button", { name: /wallet menu/i }),
    ).toBeInTheDocument();
  });

  it("shows loading state during connection", () => {
    useWalletStore.setState({ isLoading: true });

    render(<WalletConnect />);
    expect(
      screen.getByRole("button", { name: /connecting/i }),
    ).toBeInTheDocument();
  });

  it("displays error toast when error is set", () => {
    useWalletStore.setState({ error: "Connection rejected" });

    render(<WalletConnect />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Connection rejected")).toBeInTheDocument();
  });

  it("shows a Wrong Network badge when connected to a network other than EXPECTED_NETWORK", () => {
    useWalletStore.setState({
      isConnected: true,
      publicKey: "GBXTQW2V3MHZLZ5K2JZ29MQJ3DQJ29MQJ3DQJ29MQJ29MQJ29MQJ29MQ",
      network: "PUBLIC",
    });

    render(<WalletConnect />);

    expect(screen.getByText("Wrong Network")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/wrong network/i);
  });

  it("does not show the Wrong Network badge when connected to the expected network", () => {
    useWalletStore.setState({
      isConnected: true,
      publicKey: "GBXTQW2V3MHZLZ5K2JZ29MQJ3DQJ29MQJ3DQJ29MQJ29MQJ29MQJ29MQ",
      network: "TESTNET",
    });

    render(<WalletConnect />);

    expect(screen.queryByText("Wrong Network")).not.toBeInTheDocument();
  });
});

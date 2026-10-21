import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransactionHistory from "@/components/features/transactions/TransactionHistory";

let mockSearchParams = new URLSearchParams();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => "/history",
  useRouter: () => ({
    push: vi.fn(),
    replace: mockReplace,
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => mockSearchParams,
}));

describe("Transaction Deep Linking via URL Query Params", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
  });

  it("opens the detail drawer when a valid transaction ID is in the URL query params", () => {
    mockSearchParams = new URLSearchParams("tx=tx_001");
    render(<TransactionHistory />);

    expect(screen.getByRole("heading", { name: "Transaction Details" })).toBeInTheDocument();
    expect(screen.getByText("tx_001")).toBeInTheDocument();
    expect(screen.getAllByText("$9,500").length).toBeGreaterThan(0);
    expect(screen.queryByText("Transaction Not Found")).not.toBeInTheDocument();
  });

  it("opens the detail drawer in fallback state when an invalid transaction ID is in the URL query params", () => {
    mockSearchParams = new URLSearchParams("tx=invalid_tx_id");
    render(<TransactionHistory />);

    expect(screen.getByRole("heading", { name: "Transaction Details" })).toBeInTheDocument();
    expect(screen.getByText("Transaction Not Found")).toBeInTheDocument();
    expect(screen.getAllByText("invalid_tx_id").length).toBeGreaterThan(0);
    expect(screen.getByText(/could not be located/i)).toBeInTheDocument();
  });

  it("updates the URL query parameters when details button is clicked on the transaction table", () => {
    render(<TransactionHistory />);

    const detailButtons = screen.getAllByRole("button", { name: /view details for transaction tx_001/i });
    fireEvent.click(detailButtons[0]);

    expect(mockReplace).toHaveBeenCalledWith("/history?tx=tx_001", { scroll: false });
  });

  it("clears the URL query parameters when the detail drawer is closed", async () => {
    mockSearchParams = new URLSearchParams("tx=tx_001");
    render(<TransactionHistory />);

    const closeButtons = screen.getAllByRole("button", { name: /close/i });
    fireEvent.click(closeButtons[0]);

    expect(mockReplace).toHaveBeenCalledWith("/history", { scroll: false });
  });
});

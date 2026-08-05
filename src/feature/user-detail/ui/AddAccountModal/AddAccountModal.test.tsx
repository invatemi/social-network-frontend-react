import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import AddAccountModal from "./AddAccountModal";

const dispatchMock = vi.fn();
const addAccountMock = vi.fn();
const showToastMock = vi.fn();

vi.mock("@/app/store/hooks", () => ({
  useAppDispatch: () => dispatchMock,
}));

vi.mock("@/app/store/api/authApi", () => ({
  useAddAccountMutation: () => [addAccountMock, { isLoading: false }],
}));

vi.mock("@/entities/user/api", () => ({
  fetchUserProfileWithRetry: vi.fn(),
}));

vi.mock("@/app/store/lib/applyAccountSession", () => ({
  applyAccountSession: vi.fn(),
  hydrateAccounts: vi.fn(),
}));

vi.mock("@/shared", async () => {
  const actual = await vi.importActual<typeof import("@/shared")>("@/shared");
  return {
    ...actual,
    useToast: () => ({ showToast: showToastMock }),
  };
});

vi.mock("@/shared/hooks", () => ({
  useRateLimitCountdown: () => ({
    isBlocked: false,
    startCountdown: vi.fn(),
  }),
}));

describe("AddAccountModal", () => {
  beforeEach(() => {
    dispatchMock.mockReset();
    addAccountMock.mockReset();
    showToastMock.mockReset();
  });

  it("renders login form when open", () => {
    render(<AddAccountModal isOpen onClose={vi.fn()} />);
    expect(screen.getByTestId("add-account-modal")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Войти" })).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<AddAccountModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("add-account-modal")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<AddAccountModal isOpen onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

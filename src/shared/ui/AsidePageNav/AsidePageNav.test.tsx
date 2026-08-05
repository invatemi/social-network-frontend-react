import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AsidePageNav from "./AsidePageNav";

const dispatchMock = vi.fn();
const navigateMock = vi.fn();
const switchAccountMock = vi.fn();
const fetchUserProfileWithRetryMock = vi.fn();
const applyAccountSessionMock = vi.fn();
const hydrateAccountsMock = vi.fn();
const showToastMock = vi.fn();

vi.mock("@/app/store/hooks", () => ({
  useAppDispatch: () => dispatchMock,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({
      auth: {
        user: {
          id: 1,
          username: "alice",
          email: "alice@example.com",
          avatarUrl: null,
          isOnline: true,
        },
        accounts: [
          {
            id: 1,
            username: "alice",
            email: "alice@example.com",
            isActive: true,
          },
          {
            id: 2,
            username: "bob",
            email: "bob@example.com",
            isActive: false,
          },
        ],
      },
    }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/app/store/api", () => ({
  useGetFriendRequestsQuery: () => ({ data: { unreadCount: 0 } }),
}));

vi.mock("@/app/store/api/authApi", () => ({
  useSwitchAccountMutation: () => [
    switchAccountMock,
    { isLoading: false },
  ],
}));

vi.mock("@/entities/user/api", () => ({
  fetchUserProfileWithRetry: (...args: unknown[]) =>
    fetchUserProfileWithRetryMock(...args),
}));

vi.mock("@/app/store/lib/applyAccountSession", () => ({
  applyAccountSession: (...args: unknown[]) => applyAccountSessionMock(...args),
  hydrateAccounts: (...args: unknown[]) => hydrateAccountsMock(...args),
}));

vi.mock("@/shared", async () => {
  const actual = await vi.importActual<typeof import("@/shared")>("@/shared");
  return {
    ...actual,
    useToast: () => ({ showToast: showToastMock }),
  };
});

vi.mock("@/feature", () => ({
  ProfileMenu: () => <button type="button">menu</button>,
}));

describe("AsidePageNav multi-account", () => {
  beforeEach(() => {
    dispatchMock.mockReset();
    navigateMock.mockReset();
    switchAccountMock.mockReset();
    fetchUserProfileWithRetryMock.mockReset();
    applyAccountSessionMock.mockReset();
    hydrateAccountsMock.mockReset();
    showToastMock.mockReset();
    switchAccountMock.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          accessToken: "token-2",
          user: { id: 2, username: "bob", email: "bob@example.com", role: "user" },
          accounts: [
            { id: 2, username: "bob", email: "bob@example.com", isActive: true },
            { id: 1, username: "alice", email: "alice@example.com", isActive: false },
          ],
        }),
    });
    fetchUserProfileWithRetryMock.mockResolvedValue({
      id: 2,
      username: "bob",
      email: "bob@example.com",
    });
    hydrateAccountsMock.mockResolvedValue([]);
  });

  it("renders secondary account card under active profile", () => {
    render(
      <MemoryRouter>
        <AsidePageNav />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("active-account-card")).toBeInTheDocument();
    expect(screen.getByTestId("account-card-2")).toBeInTheDocument();
    expect(screen.getByText("bob")).toBeInTheDocument();
    expect(screen.getByText("bob@example.com")).toBeInTheDocument();
  });

  it("switches account on secondary card click", async () => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <MemoryRouter>
        <AsidePageNav />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText("Переключиться на bob"));

    await waitFor(() => {
      expect(switchAccountMock).toHaveBeenCalledWith({ userId: 2 });
      expect(applyAccountSessionMock).toHaveBeenCalled();
      expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
    });
  });
});

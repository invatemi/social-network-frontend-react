import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProfileMenu from "./ProfileMenu";

const openSettingsMock = vi.fn();
const navigateMock = vi.fn();
const logoutRequestMock = vi.fn();
const dispatchMock = vi.fn();

vi.mock("../../ProfileSettingsProvider", () => ({
  useProfileSettings: () => ({
    isOpen: false,
    openSettings: openSettingsMock,
    closeSettings: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/app/store/hooks", () => ({
  useAppDispatch: () => dispatchMock,
}));

vi.mock("@/app/store/api/authApi", () => ({
  useLogoutMutation: () => [logoutRequestMock, { isLoading: false }],
}));

vi.mock("@/app/store/slices/authSlice", () => ({
  logout: () => ({ type: "auth/logout" }),
}));

describe("ProfileMenu", () => {
  beforeEach(() => {
    openSettingsMock.mockReset();
    navigateMock.mockReset();
    logoutRequestMock.mockReset();
    dispatchMock.mockReset();
    logoutRequestMock.mockReturnValue({ unwrap: () => Promise.resolve() });
  });

  const renderMenu = () =>
    render(
      <MemoryRouter>
        <aside>
          <ProfileMenu
            username="Sandrs"
            email="sandrs@mail.ru"
            isOnline
            triggerClassName="trigger"
            triggerIcon={<span>☰</span>}
          />
        </aside>
      </MemoryRouter>
    );

  it("opens menu on trigger click", async () => {
    renderMenu();
    expect(screen.queryByTestId("profile-menu")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("profile-menu-trigger"));

    expect(await screen.findByTestId("profile-menu")).toBeInTheDocument();
    expect(screen.getByText("Настройки")).toBeInTheDocument();
    expect(screen.getByText("Добавить аккаунт")).toBeInTheDocument();
    expect(screen.getByText("Sandrs")).toBeInTheDocument();
  });

  it("opens settings and closes menu", async () => {
    renderMenu();
    fireEvent.click(screen.getByTestId("profile-menu-trigger"));
    expect(await screen.findByTestId("profile-menu")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Настройки"));

    expect(openSettingsMock).toHaveBeenCalledTimes(1);
    fireEvent.transitionEnd(screen.getByTestId("profile-menu"), {
      propertyName: "transform",
    });
    await waitFor(() => {
      expect(screen.queryByTestId("profile-menu")).not.toBeInTheDocument();
    });
  });

  it("closes on Escape", async () => {
    renderMenu();
    fireEvent.click(screen.getByTestId("profile-menu-trigger"));
    const menu = await screen.findByTestId("profile-menu");
    expect(menu).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.transitionEnd(menu, { propertyName: "transform" });
    await waitFor(() => {
      expect(screen.queryByTestId("profile-menu")).not.toBeInTheDocument();
    });
  });
});

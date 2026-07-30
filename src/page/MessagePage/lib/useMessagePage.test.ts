import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMessagePage } from "./useMessagePage";

const navigateMock = vi.fn();
let paramsChatId: string | undefined;

vi.mock("react-router-dom", () => ({
  useNavigate: () => navigateMock,
  useParams: () => ({ chatId: paramsChatId }),
}));

vi.mock("@/entities/message/api/messagesApi", () => ({
  useGetChatsQuery: () => ({
    data: [
      {
        chatId: 10,
        participant: { userId: 2, username: "bob", avatarUrl: null },
      },
    ],
    isLoading: false,
    refetch: vi.fn(),
  }),
  useGetMessagesQuery: () => ({
    data: [],
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  }),
  useSendMessageMutation: () => [vi.fn(), { isLoading: false }],
  useDeleteChatMutation: () => [vi.fn()],
}));

vi.mock("@/app/lib/socket", () => ({
  joinChatRoom: vi.fn(),
  leaveChatRoom: vi.fn(),
}));

vi.mock("@/feature/socket", () => ({
  useSocket: vi.fn(),
}));

vi.mock("@/app/store/hooks", () => ({
  useAppSelector: () => "token",
}));

vi.mock("@/shared/config/env", () => ({
  env: {
    apiUrl: "http://localhost:8080",
    messages: { defaultMessageLimit: 50 },
  },
}));

describe("useMessagePage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    paramsChatId = undefined;
  });

  it("keeps activeChatId null on /messages", () => {
    const { result } = renderHook(() => useMessagePage(1));
    expect(result.current.activeChatId).toBeNull();
  });

  it("syncs activeChatId from URL param", () => {
    paramsChatId = "10";
    const { result } = renderHook(() => useMessagePage(1));
    expect(result.current.activeChatId).toBe(10);
    expect(result.current.activeChat?.chatId).toBe(10);
  });

  it("navigates to chat on select and back on close", () => {
    const { result } = renderHook(() => useMessagePage(1));

    act(() => {
      result.current.handleChatSelect(10);
    });
    expect(navigateMock).toHaveBeenCalledWith("/messages/10");
    expect(result.current.activeChatId).toBe(10);

    act(() => {
      result.current.handleCloseChat();
    });
    expect(navigateMock).toHaveBeenCalledWith("/messages");
    expect(result.current.activeChatId).toBeNull();
  });
});

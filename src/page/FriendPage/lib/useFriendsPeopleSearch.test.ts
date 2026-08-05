import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFriendsPeopleSearch } from "./useFriendsPeopleSearch";

vi.mock("@/shared/config/env", () => ({
  env: {
    search: {
      debounceMs: 50,
      minQueryLength: 2,
    },
  },
}));

const mockUseSearchUsersQuery = vi.fn();

vi.mock("@/entities/search-user/api", () => ({
  useSearchUsersQuery: (...args: unknown[]) => mockUseSearchUsersQuery(...args),
}));

describe("useFriendsPeopleSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockUseSearchUsersQuery.mockReturnValue({
      data: {
        users: [
          { id: 1, username: "me" },
          { id: 2, username: "alice_friend" },
          { id: 3, username: "alice_other" },
        ],
      },
      isLoading: false,
      isFetching: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("keeps search inactive for short queries", () => {
    const { result } = renderHook(() =>
      useFriendsPeopleSearch("a", {
        enabled: true,
        currentUserId: 1,
        friendIds: [2],
      })
    );

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.isSearchActive).toBe(false);
    expect(result.current.otherUsers).toEqual([]);
    expect(mockUseSearchUsersQuery).toHaveBeenCalledWith(
      { query: "a" },
      { skip: true }
    );
  });

  it("excludes current user and friends from other users", () => {
    const { result } = renderHook(() =>
      useFriendsPeopleSearch("alice", {
        enabled: true,
        currentUserId: 1,
        friendIds: [2],
      })
    );

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.isSearchActive).toBe(true);
    expect(result.current.otherUsers).toEqual([
      { id: 3, username: "alice_other" },
    ]);
    expect(mockUseSearchUsersQuery).toHaveBeenCalledWith(
      { query: "alice" },
      { skip: false }
    );
  });

  it("does not activate when disabled", () => {
    const { result } = renderHook(() =>
      useFriendsPeopleSearch("alice", {
        enabled: false,
        currentUserId: 1,
        friendIds: [],
      })
    );

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current.isSearchActive).toBe(false);
    expect(result.current.otherUsers).toEqual([]);
    expect(mockUseSearchUsersQuery).toHaveBeenCalledWith(
      { query: "alice" },
      { skip: true }
    );
  });
});

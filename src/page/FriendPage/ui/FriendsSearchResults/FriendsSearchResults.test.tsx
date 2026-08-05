import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import FriendsSearchResults from "./FriendsSearchResults";

vi.mock("@/widget", () => ({
  FriendList: ({
    friends,
    emptyTitle,
  }: {
    friends: { id: number; username: string }[];
    emptyTitle?: string;
  }) => (
    <div data-testid="friend-list">
      {friends.length === 0
        ? emptyTitle
        : friends.map((friend) => (
            <div key={friend.id}>{friend.username}</div>
          ))}
    </div>
  ),
}));

vi.mock("../PeopleSearchCard", () => ({
  PeopleSearchCard: ({
    user,
  }: {
    user: { id: number; username: string };
  }) => (
    <div>
      <span>@{user.username}</span>
      <button type="button">Добавить в друзья {user.id}</button>
    </div>
  ),
}));

describe("FriendsSearchResults", () => {
  it("renders friends and other users sections", () => {
    render(
      <FriendsSearchResults
        friends={[
          {
            id: 2,
            username: "alice_friend",
            avatarUrl: null,
          },
        ]}
        otherUsers={[
          {
            id: 3,
            username: "alice_other",
            avatarUrl: null,
            bio: "hello",
          },
        ]}
        isOthersLoading={false}
        currentUserId={1}
      />
    );

    expect(screen.getByTestId("friends-search-results")).toBeInTheDocument();
    expect(screen.getByTestId("friends-search-friends")).toHaveTextContent(
      "alice_friend"
    );
    expect(screen.getByTestId("friends-search-others")).toHaveTextContent(
      "@alice_other"
    );
    expect(
      screen.getByRole("button", { name: "Добавить в друзья 3" })
    ).toBeInTheDocument();
    expect(screen.queryByText("@alice_friend")).not.toBeInTheDocument();
  });

  it("shows empty friends and others states", () => {
    render(
      <FriendsSearchResults
        friends={[]}
        otherUsers={[]}
        isOthersLoading={false}
        friendsEmptyTitle="Нет друзей по запросу"
      />
    );

    expect(screen.getByTestId("friend-list")).toHaveTextContent(
      "Нет друзей по запросу"
    );
    expect(screen.getByTestId("friends-search-others-empty")).toHaveTextContent(
      "Никого не найдено"
    );
  });

  it("shows loading state for other users", () => {
    render(
      <FriendsSearchResults
        friends={[]}
        otherUsers={[]}
        isOthersLoading={true}
      />
    );

    expect(
      screen.getByTestId("friends-search-others-loading")
    ).toBeInTheDocument();
  });
});

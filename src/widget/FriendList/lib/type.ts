export type FriendItem = {
  id: number;
  username: string;
  avatarUrl: string | null;
  friendsSince: string;
};

export type FriendListProps = {
  friends: FriendItem[];
};
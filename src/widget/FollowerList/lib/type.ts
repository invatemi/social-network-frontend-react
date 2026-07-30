import { FollowerCardProps } from "@/entities/follower/lib";

export type FollowerItem = FollowerCardProps;

export type FollowerListProps = {
  followers: FollowerItem[];
  onMessageClick?: (userId: number) => void;
  emptyTitle?: string;
};

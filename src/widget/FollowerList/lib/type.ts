import { FollowerCardProps } from "@/entities/follower/ui/FollowerCard";

export type FollowerItem = FollowerCardProps;

export type FollowerListProps = {
  followers: FollowerItem[];
};
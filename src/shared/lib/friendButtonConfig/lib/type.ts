import { FriendStatus } from "@/feature/friend/lib/types";

export type FriendButtonConfig = {
  text: string;
  variant: "primary" | "warning" | "success" | "secondary" | "danger";
  onClick: () => void;
  disabled: boolean;
  ariaLabel: string;
  showSecondary?: boolean;
  secondaryText?: string;
  secondaryVariant?: "secondary" | "danger";
  secondaryOnClick?: () => void;
};

export type GetFriendButtonConfigParams = {
  status: FriendStatus;
  isFollowing: boolean;
  isRequestReceiver: boolean;
  isLoading: boolean;
  handlers: {
    onAdd: () => void;
    onUnfollow: () => void;
    onCancel: () => void;
    onAccept: () => void;
    onDecline: () => void;
    onRemove: () => void;
  };
};
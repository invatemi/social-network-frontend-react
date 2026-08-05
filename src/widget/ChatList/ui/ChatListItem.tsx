import { memo, useCallback } from "react";
import { ChatCard } from "@/entities";
import type { ChatData } from "@/entities/message/api/messagesApi";
import { useAppSelector } from "@/app/store/hooks";
import { selectIsUserOnline } from "@/app/store/slices/presenceSlice";
import { formatChatTime } from "../lib";

type ChatListItemProps = {
  chat: ChatData;
  isActive: boolean;
  onChatSelect?: (chatId: number) => void;
};

const ChatListItem = ({ chat, isActive, onChatSelect }: ChatListItemProps) => {
  const userId = chat.participant?.userId;
  const presenceOnline = useAppSelector((state) =>
    selectIsUserOnline(state, userId)
  );

  const handleClick = useCallback(
    (chatId: number) => {
      onChatSelect?.(chatId);
    },
    [onChatSelect]
  );

  const username = chat.isGroup
    ? chat.chatName || "Групповой чат"
    : chat.participant?.username || "Собеседник";

  const avatarUrl = chat.isGroup ? null : chat.participant?.avatarUrl || null;
  const isOnline = presenceOnline || (chat.participant?.isOnline ?? false);
  const lastMessageTime =
    chat.lastMessage?.createdAt || chat.lastMessageAt || null;

  return (
    <ChatCard
      chatId={chat.chatId}
      avatarUrl={avatarUrl}
      username={username}
      lastMessage={chat.lastMessage?.content || ""}
      lastMessageTime={lastMessageTime ? formatChatTime(lastMessageTime) : ""}
      unreadCount={isActive ? 0 : chat.unreadCount}
      isOnline={isOnline}
      onClick={handleClick}
      isActive={isActive}
    />
  );
};

export default memo(ChatListItem);

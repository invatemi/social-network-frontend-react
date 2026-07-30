import { ChatCard } from "@/entities";
import { useAppSelector } from "@/app/store/hooks";
import { formatChatTime, ChatListProps } from "../lib";
import { useChatList } from "../hooks/useChatList";
import style from "./ChatList.module.css";

/**
 * ChatList — список чатов
 */
const ChatList = ({
  chats = [],
  onChatSelect,
  activeChatId = null,
  className = "",
}: ChatListProps) => {
  const presence = useAppSelector((state) => state.presence.byUserId);
  const { groupedChats, searchQuery, setSearchQuery, isLoading } =
    useChatList(chats);

  const handleChatClick = (chatId: number) => {
    onChatSelect?.(chatId);
  };

  if (isLoading) {
    return (
      <div className={`${style.container} ${className}`}>
        <div className={style.loadingState}>Загрузка...</div>
      </div>
    );
  }

  const flatEmpty = Object.keys(groupedChats).length === 0;

  return (
    <div className={`${style.container} ${className}`}>
      <div className={style.searchField}>
        <span className={style.searchIcon} aria-hidden />
        <input
          type="search"
          className={style.searchInput}
          placeholder="Поиск"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Поиск по чатам"
          autoComplete="off"
        />
      </div>

      <div className={style.chatsList}>
        {flatEmpty ? (
          <div className={style.emptyState}>
            <p className={style.emptyText}>
              {searchQuery ? "Ничего не найдено" : "Нет чатов"}
            </p>
          </div>
        ) : (
          Object.entries(groupedChats).map(([group, groupChats]) => (
            <div key={group} className={style.section}>
              {groupChats.map((chat) => {
                const username = chat.isGroup
                  ? chat.chatName || "Групповой чат"
                  : chat.participant?.username || "Собеседник";

                const avatarUrl = chat.isGroup
                  ? null
                  : chat.participant?.avatarUrl || null;

                const userId = chat.participant?.userId;
                const isOnline =
                  (userId != null && presence[String(userId)] === true) ||
                  (chat.participant?.isOnline ?? false);

                const lastMessageTime =
                  chat.lastMessage?.createdAt || chat.lastMessageAt || null;

                return (
                  <ChatCard
                    key={chat.chatId}
                    chatId={chat.chatId}
                    avatarUrl={avatarUrl}
                    username={username}
                    lastMessage={chat.lastMessage?.content || ""}
                    lastMessageTime={
                      lastMessageTime ? formatChatTime(lastMessageTime) : ""
                    }
                    unreadCount={chat.unreadCount}
                    isOnline={isOnline}
                    onClick={handleChatClick}
                    isActive={activeChatId === chat.chatId}
                  />
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;

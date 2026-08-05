import { useCallback } from "react";
import { ChatListProps } from "../lib";
import { useChatList } from "../hooks/useChatList";
import ChatListItem from "./ChatListItem";
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
  const { groupedChats, searchQuery, setSearchQuery, isLoading } =
    useChatList(chats);

  const handleChatSelect = useCallback(
    (chatId: number) => {
      onChatSelect?.(chatId);
    },
    [onChatSelect]
  );

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
              {groupChats.map((chat) => (
                <ChatListItem
                  key={chat.chatId}
                  chat={chat}
                  isActive={activeChatId === chat.chatId}
                  onChatSelect={handleChatSelect}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;

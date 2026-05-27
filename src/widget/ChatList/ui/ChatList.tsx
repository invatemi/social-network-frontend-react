import { ChatCard } from '@/entities';
import { formatChatTime, ChatListProps } from '../lib';
import { useChatList } from '../hooks/useChatList';
import style from './ChatList.module.css';

/**
 * ChatList — список чатов
 */
const ChatList = ({
  chats = [],
  onChatSelect,
  activeChatId = null,
  className = '',
}: ChatListProps) => {
  const {
    groupedChats,
    searchQuery,
    setSearchQuery,
    isLoading,
  } = useChatList(chats);

  const handleChatClick = (chatId: number) => {
    onChatSelect?.(chatId);
  };

  // ASCII-иконка поиска
  const SearchIcon = () => <span className={style.iconAscii}>{`[?]`}</span>;

  // ASCII-иконка пустого состояния
  const EmptyIcon = () => <span className={style.iconLarge}>{`[∅]`}</span>;

  if (isLoading) {
    return (
      <div className={`${style.container} ${className}`}>
        <div className={style.loadingState}>
          <span className={style.spinnerAscii}>{`[loading...]`}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${style.container} ${className}`}>
      <div className={style.header}>
        <h2 className={style.title}>
          <span className={style.prompt}>{`>`}</span>
          <span>{`chats`}</span>
        </h2>
        
        <div className={style.searchWrapper}>
          <span className={style.searchIcon}>
            <SearchIcon />
          </span>
          <input
            type="text"
            className={style.searchInput}
            placeholder={"> search_chats..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Поиск по чатам"
          />
        </div>
      </div>

      <div className={style.chatsList}>
        {Object.keys(groupedChats).length === 0 ? (
          <div className={style.emptyState}>
            <EmptyIcon />
            <p className={style.emptyText}>
              {searchQuery ? `// no_results` : `// no_chats`}
            </p>
          </div>
        ) : (
          Object.entries(groupedChats).map(([group, groupChats]) => (
            <div key={group} className={style.section}>
              <h3 className={style.sectionTitle}>{`// ${group}`}</h3>
              
              {groupChats.map((chat) => {
                const username = chat.isGroup 
                  ? chat.chatName || 'Групповой чат' 
                  : chat.participant?.username || 'Собеседник';
                
                const avatarUrl = chat.isGroup 
                  ? null
                  : chat.participant?.avatarUrl || null;
                
                const isOnline = chat.participant?.isOnline ?? false;
                const lastMessageTime = 
                  chat.lastMessage?.createdAt || 
                  chat.lastMessageAt || 
                  null;

                return (
                  <div key={chat.chatId} className={style.chatCardWrapper}>
                    <ChatCard
                      chatId={chat.chatId}
                      avatarUrl={avatarUrl}
                      username={username}
                      lastMessage={chat.lastMessage?.content || '// no messages'}
                      lastMessageTime={formatChatTime(lastMessageTime)}
                      unreadCount={chat.unreadCount}
                      isOnline={isOnline}
                      onClick={handleChatClick}
                      isActive={activeChatId === chat.chatId}
                    />
                  </div>
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
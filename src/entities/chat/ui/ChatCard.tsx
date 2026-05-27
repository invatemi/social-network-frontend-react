import { ChatCardProps } from "../lib";
import style from "./ChatCard.module.css";

/**
 * ChatCard — карточка чата
 */
const ChatCard = ({
  chatId,
  avatarUrl,
  username,
  lastMessage,
  lastMessageTime,
  unreadCount = 0,
  isOnline = false,
  onClick,
  isActive = false,
}: ChatCardProps) => {
  const initial = username.charAt(0).toUpperCase();
  
  const handleClick = () => onClick?.(chatId);

  return (
    <div 
      className={`${style.card} ${isActive ? style.active : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Чат с ${username}`}
    >
      <div className={style.avatarWrapper}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={username} className={style.avatar} loading="lazy" />
        ) : (
          <div className={style.avatarPlaceholder} aria-hidden="true">
            {`[${initial}]`}
          </div>
        )}
        <span className={`${style.statusIndicator} ${isOnline ? style.online : style.offline}`}>
          {isOnline ? `[•]` : `[○]`}
        </span>
      </div>

      <div className={style.info}>
        <div className={style.header}>
          <span className={style.username}>{`@${username}`}</span>
          <span className={style.time}>{`[${lastMessageTime}]`}</span>
        </div>
        <span className={style.lastMessage}>{lastMessage ? `> ${lastMessage}` : '// no messages'}</span>
      </div>

      {unreadCount > 0 && (
        <span className={style.unreadBadge} aria-label={`${unreadCount} непрочитанных`}>
          {`{${unreadCount > 99 ? '99+' : unreadCount}}`}
        </span>
      )}
    </div>
  );
};

export default ChatCard;
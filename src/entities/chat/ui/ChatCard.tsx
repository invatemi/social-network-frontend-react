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
      className={[style.card, isActive ? style.active : ""].filter(Boolean).join(" ")}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
      aria-label={`Чат с ${username}`}
      aria-current={isActive ? "true" : undefined}
    >
      <div className={style.avatarWrapper}>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className={style.avatar} loading="lazy" />
        ) : (
          <div className={style.avatarPlaceholder} aria-hidden>
            {initial}
          </div>
        )}
        <span
          className={[style.onlineDot, isOnline ? style.online : style.offline]
            .filter(Boolean)
            .join(" ")}
          aria-label={isOnline ? "Онлайн" : "Офлайн"}
        />
      </div>

      <div className={style.info}>
        <div className={style.header}>
          <span className={style.username}>
            {username}
            {unreadCount > 0 ? (
              <span
                className={style.unreadDot}
                aria-label={`${unreadCount} непрочитанных`}
              />
            ) : null}
          </span>
          <span className={style.time}>{lastMessageTime}</span>
        </div>
        <span className={style.lastMessage}>
          {lastMessage || "Нет сообщений"}
        </span>
      </div>
    </div>
  );
};

export default ChatCard;

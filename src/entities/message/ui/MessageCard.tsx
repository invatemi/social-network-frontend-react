import { MessageCardProps } from "../lib";
import style from "./MessageCard.module.css";

/**
 * MessageCard — карточка сообщения
 */
const MessageCard = ({
  messageId,
  sender,
  avatarUrl,
  senderName,
  text,
  timestamp,
  status = 'sent',
  isError = false,
}: MessageCardProps) => {
  const isMe = sender === 'me';
  const initial = senderName?.charAt(0).toUpperCase() || '?';

  const StatusIndicator = () => {
    if (isError) return <span className={style.statusError}>{`[!ERR]`}</span>;
    if (status === 'read') return <span className={style.statusRead}>{`[READ]`}</span>;
    if (status === 'delivered') return <span className={style.statusDelivered}>{`[OK]`}</span>;
    return <span className={style.statusSent}>{`[·]`}</span>;
  };

  return (
    <div 
      className={`${style.message} ${style[sender]} ${isError ? style.error : ''}`}
      data-message-id={messageId}
    >
      {!isMe && (
        <div className={style.avatarWrapper}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={senderName || 'Собеседник'} className={style.avatar} loading="lazy" />
          ) : (
            <div className={style.avatarPlaceholder} aria-hidden="true">
              {`[${initial}]`}
            </div>
          )}
        </div>
      )}

      <div className={style.bubble}>
        {senderName && !isMe && (
          <div className={style.senderName}>{`@${senderName}`}</div>
        )}
        
        <div className={style.text}>{text}</div>
        
        <div className={style.meta}>
          <time dateTime={timestamp} className={style.timestamp}>{`[${timestamp}]`}</time>
          {isMe && <span className={style.status}><StatusIndicator /></span>}
        </div>
      </div>
    </div>
  );
};

export default MessageCard;
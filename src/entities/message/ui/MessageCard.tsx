import { MessageCardProps } from "../lib";
import style from "./MessageCard.module.css";

/**
 * MessageCard — карточка сообщения
 */
const MessageCard = ({
  messageId,
  sender,
  text,
  timestamp,
  status = "sent",
  isError = false,
}: MessageCardProps) => {
  const isMe = sender === "me";

  return (
    <div
      className={[
        style.message,
        isMe ? style.me : style.other,
        isError ? style.error : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-message-id={messageId}
    >
      <div className={style.bubble}>
        <div className={style.text}>{text}</div>
        <div className={style.meta}>
          <time className={style.timestamp}>{timestamp}</time>
          {isMe && (
            <span
              className={[
                style.ticks,
                status === "read" ? style.ticksRead : "",
                isError ? style.ticksError : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-label={
                isError
                  ? "Ошибка"
                  : status === "read"
                    ? "Прочитано"
                    : "Отправлено"
              }
            >
              {isError ? "!" : status === "read" ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageCard;

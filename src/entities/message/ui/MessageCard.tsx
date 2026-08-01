import { useEffect, useRef, useState } from "react";
import { MessageCardProps } from "../lib";
import { MessageCheckIcon, MessageChecksIcon } from "@/shared/ui/icons";
import style from "./MessageCard.module.css";

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

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
  attachments = [],
}: MessageCardProps) => {
  const isMe = sender === "me";
  const isRead = status === "read";
  const prevReadRef = useRef(isRead);
  const [animateSecond, setAnimateSecond] = useState(false);

  useEffect(() => {
    if (isRead && !prevReadRef.current) {
      setAnimateSecond(true);
    }
    prevReadRef.current = isRead;
  }, [isRead]);

  const hasText = Boolean(text?.trim());
  const images = attachments.filter((a) => a.kind === "image");
  const files = attachments.filter((a) => a.kind === "file");

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
        {images.length > 0 ? (
          <div className={style.attachmentsImages}>
            {images.map((img) => (
              <a
                key={img.id}
                href={img.url}
                target="_blank"
                rel="noreferrer"
                className={style.imageLink}
              >
                <img src={img.url} alt={img.fileName} className={style.image} />
              </a>
            ))}
          </div>
        ) : null}

        {files.length > 0 ? (
          <ul className={style.attachmentsFiles}>
            {files.map((file) => (
              <li key={file.id}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className={style.fileLink}
                >
                  <span className={style.fileName}>{file.fileName}</span>
                  <span className={style.fileSize}>
                    {formatSize(file.sizeBytes)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        {hasText ? <span className={style.text}>{text}</span> : null}

        <span className={style.meta}>
          <time className={style.timestamp}>{timestamp}</time>
          {isMe && (
            <span
              className={[style.ticks, isError ? style.ticksError : ""]
                .filter(Boolean)
                .join(" ")}
              aria-label={
                isError ? "Ошибка" : isRead ? "Прочитано" : "Отправлено"
              }
            >
              {isError ? (
                "!"
              ) : isRead ? (
                <MessageChecksIcon
                  className={style.tickIcon}
                  animateSecond={animateSecond}
                />
              ) : (
                <MessageCheckIcon className={style.tickIcon} />
              )}
            </span>
          )}
        </span>
      </div>
    </div>
  );
};

export default MessageCard;

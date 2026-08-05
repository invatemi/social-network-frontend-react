import {
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { MessageCardProps } from "../lib";
import { MessageCheckIcon, MessageChecksIcon } from "@/shared/ui/icons";
import style from "./MessageCard.module.css";

const ALBUM_MAX_WIDTH = 320;
const ALBUM_GAP = 2;

const formatSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

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
  onImageClick,
  editedAt,
  replyTo = null,
  isJumpTarget = false,
  isFocused = false,
  isEditingTarget = false,
  isSelected = false,
  selectionMode = false,
  onContextMenu,
  onDoubleClick,
  onSelectToggle,
  onReplyQuoteClick,
}: MessageCardProps) => {
  const isMe = sender === "me";
  const isRead = status === "read";
  const prevReadRef = useRef(isRead);
  const prevEditRef = useRef<{
    messageId: number;
    text: string;
    editedAt?: string | null;
  } | null>(null);
  const [animateSecond, setAnimateSecond] = useState(false);
  const [justEdited, setJustEdited] = useState(false);
  const [ratios, setRatios] = useState<Record<number, number>>({});

  useEffect(() => {
    if (isRead && !prevReadRef.current) {
      setAnimateSecond(true);
    }
    prevReadRef.current = isRead;
  }, [isRead]);

  useEffect(() => {
    const prev = prevEditRef.current;
    prevEditRef.current = { messageId, text, editedAt };

    if (!prev || prev.messageId !== messageId) {
      setJustEdited(false);
      return;
    }
    if (prev.text === text && prev.editedAt === editedAt) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    setJustEdited(true);
    const timer = window.setTimeout(() => setJustEdited(false), 300);
    return () => window.clearTimeout(timer);
  }, [messageId, text, editedAt]);

  useEffect(() => {
    setRatios({});
  }, [messageId]);

  const hasText = Boolean(text?.trim());
  const images = attachments.filter((a) => a.kind === "image");
  const files = attachments.filter((a) => a.kind === "file");
  const imageCount = images.length;
  const hasOnlyMedia = imageCount > 0 && !hasText && files.length === 0;

  const albumLayout =
    imageCount <= 1
      ? "single"
      : imageCount === 2
        ? "pair"
        : imageCount === 3
          ? "trio"
          : imageCount === 4
            ? "quad"
            : "many";

  const albumStyle = useMemo(() => {
    if (imageCount !== 2) return undefined;

    const first = ratios[images[0]?.id ?? -1];
    const second = ratios[images[1]?.id ?? -1];
    if (!first || !second) {
      return { ["--album-height" as string]: "200px" };
    }

    const colW = (ALBUM_MAX_WIDTH - ALBUM_GAP) / 2;
    const fitted = (colW / first + colW / second) / 2;
    const height = Math.round(clamp(fitted, 156, 240));
    return { ["--album-height" as string]: `${height}px` };
  }, [imageCount, images, ratios]);

  const rememberRatio = (id: number, naturalWidth: number, naturalHeight: number) => {
    if (!naturalWidth || !naturalHeight) return;
    const next = naturalWidth / naturalHeight;
    setRatios((prev) => (prev[id] === next ? prev : { ...prev, [id]: next }));
  };

  const handleImageLoad = (
    id: number,
    event: SyntheticEvent<HTMLImageElement>
  ) => {
    rememberRatio(
      id,
      event.currentTarget.naturalWidth,
      event.currentTarget.naturalHeight
    );
  };

  const bindImageRef = (id: number) => (el: HTMLImageElement | null) => {
    if (!el || !el.complete) return;
    rememberRatio(id, el.naturalWidth, el.naturalHeight);
  };

  const renderImage = (
    img: (typeof images)[number],
    imageIndex: number,
    extraClassName = ""
  ) => {
    const className = [style.imageLink, extraClassName]
      .filter(Boolean)
      .join(" ");
    const media = (
      <img
        ref={bindImageRef(img.id)}
        src={img.url}
        alt={img.fileName}
        className={style.image}
        onLoad={(event) => handleImageLoad(img.id, event)}
      />
    );

    if (onImageClick) {
      return (
        <button
          key={img.id}
          type="button"
          className={className}
          onClick={(event) => {
            event.stopPropagation();
            onImageClick(imageIndex);
          }}
          aria-label={img.fileName || "Открыть изображение"}
        >
          {media}
        </button>
      );
    }

    return (
      <a
        key={img.id}
        href={img.url}
        target="_blank"
        rel="noreferrer"
        className={className}
        onClick={(event) => event.stopPropagation()}
      >
        {media}
      </a>
    );
  };

  return (
    <div
      className={[
        style.message,
        isMe ? style.me : style.other,
        isError ? style.error : "",
        isFocused || isSelected ? style.elevated : "",
        isSelected ? style.selected : "",
        isEditingTarget ? style.editingTarget : "",
        justEdited ? style.justEdited : "",
        isJumpTarget ? style.jumpTarget : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-message-id={messageId}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      onClick={
        selectionMode
          ? (event) => {
              event.preventDefault();
              onSelectToggle?.();
            }
          : undefined
      }
      role={selectionMode ? "button" : undefined}
      tabIndex={selectionMode ? 0 : undefined}
      onKeyDown={
        selectionMode
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectToggle?.();
              }
            }
          : undefined
      }
    >
      <div
        data-message-bubble
        className={[
          style.bubble,
          hasOnlyMedia ? style.bubbleMedia : "",
          isSelected ? style.bubbleSelected : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {imageCount > 0 ? (
          <div
            className={[
              style.attachmentsImages,
              imageCount === 1
                ? style.attachmentsSingle
                : style.attachmentsAlbum,
            ]
              .filter(Boolean)
              .join(" ")}
            data-layout={albumLayout}
            style={albumStyle}
          >
            {images.map((img, imageIndex) => {
              const isLastOdd =
                albumLayout === "many" &&
                imageIndex === imageCount - 1 &&
                imageCount % 2 === 1;

              return renderImage(
                img,
                imageIndex,
                isLastOdd ? style.imageSpanFull : ""
              );
            })}
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
                  onClick={(event) => event.stopPropagation()}
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

        {replyTo ? (
          <button
            type="button"
            data-reply-quote
            className={[
              style.replyQuote,
              onReplyQuoteClick ? style.replyQuoteClickable : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              onReplyQuoteClick?.(replyTo.messageId);
            }}
            onDoubleClick={(event) => event.stopPropagation()}
            onContextMenu={(event) => event.stopPropagation()}
            disabled={!onReplyQuoteClick}
            aria-label={`Перейти к сообщению от ${replyTo.authorName}`}
          >
            <span className={style.replyAuthor}>{replyTo.authorName}</span>
            {replyTo.text.trim() ? (
              <span className={style.replyText}>{replyTo.text}</span>
            ) : (
              <span className={style.replyTextMuted}>Вложение</span>
            )}
            <span className={style.replyMeta}>
              <time className={style.replyTimestamp}>{replyTo.timestamp}</time>
            </span>
          </button>
        ) : null}

        {hasText ? <span className={style.text}>{text}</span> : null}

        <span className={style.meta}>
          {editedAt ? <span className={style.edited}>изм.</span> : null}
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

export default memo(MessageCard);

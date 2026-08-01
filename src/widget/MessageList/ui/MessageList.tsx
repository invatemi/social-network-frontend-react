import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { MessageCard } from "@/entities";
import { MessageSend } from "@/feature";
import { useAppSelector } from "@/app/store/hooks";
import { useMessageList } from "../hooks/useMessageList";
import {
  formatMessageTime,
  formatMessageDate,
  shouldShowDateSeparator,
  MessageListProps,
  UIMessageData,
} from "../lib";
import style from "./MessageList.module.css";

const BOTTOM_STICK_THRESHOLD_PX = 72;

/**
 * MessageList — список сообщений
 */
const MessageList = ({
  chatId,
  recipient,
  initialMessages = [],
  onSendMessage,
  onBack,
  className = "",
}: MessageListProps) => {
  const [messageText, setMessageText] = useState("");
  const stickToBottomRef = useRef(true);
  const presenceOnline = useAppSelector(
    (state) => state.presence.byUserId[String(recipient.userId)] === true
  );
  const isOnline = presenceOnline || recipient.isOnline;

  const {
    messages,
    isLoading,
    isLoadingMore,
    observerTarget,
    messagesContainerRef,
    handleSendMessage: handleSendFromHook,
    scrollToBottom,
  } = useMessageList({
    chatId,
    initialMessages,
    onSendMessage,
  });

  const initial = recipient.username.charAt(0).toUpperCase();
  const profilePath = recipient.userId > 0 ? `/user/${recipient.userId}` : null;

  const handleSend = async (_chatId: number, text: string, files?: File[]) => {
    await handleSendFromHook(text, files);
    setMessageText("");
    stickToBottomRef.current = true;
  };

  const updateStickToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const gap =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    stickToBottomRef.current = gap <= BOTTOM_STICK_THRESHOLD_PX;
  }, [messagesContainerRef]);

  const keepLastMessageVisible = useCallback(() => {
    if (!stickToBottomRef.current) return;
    scrollToBottom("auto");
  }, [scrollToBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", updateStickToBottom, {
      passive: true,
    });
    return () => {
      container.removeEventListener("scroll", updateStickToBottom);
    };
  }, [messagesContainerRef, updateStickToBottom, isLoading]);

  if (isLoading) {
    return (
      <div className={`${style.container} ${className}`}>
        <div className={style.emptyState}>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  const profileContent = (
    <>
      <div className={style.avatarWrapper}>
        {recipient.avatarUrl ? (
          <img src={recipient.avatarUrl} alt="" className={style.avatar} />
        ) : (
          <div className={style.avatarPlaceholder}>{initial}</div>
        )}
        <span
          className={[style.onlineDot, isOnline ? style.online : style.offline]
            .filter(Boolean)
            .join(" ")}
        />
      </div>

      <div className={style.userInfo}>
        <span className={style.username}>{recipient.username}</span>
        {recipient.email ? (
          <span className={style.email}>{recipient.email}</span>
        ) : (
          <span className={style.email}>
            {isOnline ? "Онлайн" : "Не в сети"}
          </span>
        )}
      </div>
    </>
  );

  return (
    <div className={`${style.container} ${className}`}>
      <div className={style.header}>
        {onBack ? (
          <button
            type="button"
            className={style.backButton}
            onClick={onBack}
            aria-label="Назад к списку чатов"
          >
            ←
          </button>
        ) : null}

        {profilePath ? (
          <Link
            to={profilePath}
            className={style.profileLink}
            aria-label={`Профиль ${recipient.username}`}
          >
            {profileContent}
          </Link>
        ) : (
          <div className={style.profileLink}>{profileContent}</div>
        )}
      </div>

      <div ref={messagesContainerRef} className={style.messagesContainer}>
        {isLoadingMore ? (
          <div className={style.loadMoreIndicator}>Загрузка истории...</div>
        ) : null}

        <div ref={observerTarget} />

        {messages.length === 0 ? (
          <div className={style.emptyState}>
            <p className={style.emptyText}>Нет сообщений</p>
            <p className={style.emptySubtext}>Напишите первым</p>
          </div>
        ) : (
          messages.map((message: UIMessageData, index: number) => {
            const previousMessage = messages[index - 1];
            const showDateSeparator = shouldShowDateSeparator(
              message.createdAt,
              previousMessage?.createdAt
            );

            return (
              <div key={message.messageId}>
                {showDateSeparator ? (
                  <div className={style.dateSeparator}>
                    <span className={style.dateText}>
                      {formatMessageDate(message.createdAt)}
                    </span>
                  </div>
                ) : null}

                <MessageCard
                  messageId={message.messageId}
                  sender={message.sender}
                  senderName={message.senderName}
                  text={message.text}
                  timestamp={formatMessageTime(message.createdAt)}
                  status={message.status === "error" ? "sent" : message.status}
                  isError={message.isError}
                  attachments={message.attachments}
                />
              </div>
            );
          })
        )}
      </div>

      <MessageSend
        chatId={chatId}
        value={messageText}
        onChange={setMessageText}
        onSend={handleSend}
        isLoading={isLoadingMore}
        disabled={!recipient || isLoading}
        placeholder="Сообщение"
        maxLength={2000}
        autoFocus
        onComposerHeightChange={keepLastMessageVisible}
      />
    </div>
  );
};

export default MessageList;

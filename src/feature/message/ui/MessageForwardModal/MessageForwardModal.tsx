import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  useForwardMessagesMutation,
  useGetChatsQuery,
} from "@/entities/message/api/messagesApi";
import style from "./MessageForwardModal.module.css";

export type MessageForwardModalProps = {
  isOpen: boolean;
  messageIds: number[];
  excludeChatId?: number;
  onClose: () => void;
  onForwarded?: () => void;
};

/**
 * MessageForwardModal — выбор чатов для пересылки сообщений
 */
const MessageForwardModal = ({
  isOpen,
  messageIds,
  excludeChatId,
  onClose,
  onForwarded,
}: MessageForwardModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [selectedChatIds, setSelectedChatIds] = useState<number[]>([]);
  const { data: chats = [], isLoading } = useGetChatsQuery(undefined, {
    skip: !isOpen,
  });
  const [forwardMessages, { isLoading: isForwarding }] =
    useForwardMessagesMutation();

  const availableChats = useMemo(
    () => chats.filter((chat) => chat.chatId !== excludeChatId),
    [chats, excludeChatId]
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedChatIds([]);
      return;
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || isForwarding) return;
      event.preventDefault();
      onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isForwarding, onClose]);

  useEffect(() => {
    if (isOpen && modalRef.current) modalRef.current.focus();
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const toggleChat = (chatId: number) => {
    setSelectedChatIds((prev) =>
      prev.includes(chatId)
        ? prev.filter((id) => id !== chatId)
        : [...prev, chatId]
    );
  };

  const handleConfirm = async () => {
    if (selectedChatIds.length === 0 || messageIds.length === 0) return;
    try {
      await forwardMessages({
        messageIds,
        targetChatIds: selectedChatIds,
      }).unwrap();
      onForwarded?.();
      onClose();
    } catch (error) {
      console.error("Failed to forward messages:", error);
    }
  };

  return createPortal(
    <div
      className={style.overlay}
      onClick={(event) => {
        if (event.target === event.currentTarget && !isForwarding) onClose();
      }}
    >
      <div
        ref={modalRef}
        className={style.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Переслать сообщения"
        tabIndex={-1}
      >
        <div className={style.header}>
          <h2 className={style.title}>
            Переслать {messageIds.length > 1 ? `(${messageIds.length})` : ""}
          </h2>
          <button
            type="button"
            className={style.closeButton}
            onClick={onClose}
            disabled={isForwarding}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className={style.content}>
          {isLoading ? (
            <p className={style.loading}>Загрузка чатов...</p>
          ) : availableChats.length === 0 ? (
            <p className={style.empty}>Нет доступных чатов</p>
          ) : (
            <ul className={style.list}>
              {availableChats.map((chat) => {
                const name =
                  chat.participant?.username || chat.chatName || "Чат";
                const initial = name.charAt(0).toUpperCase();
                const selected = selectedChatIds.includes(chat.chatId);
                return (
                  <li key={chat.chatId}>
                    <button
                      type="button"
                      className={[
                        style.chatButton,
                        selected ? style.chatSelected : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => toggleChat(chat.chatId)}
                      disabled={isForwarding}
                    >
                      {chat.participant?.avatarUrl ? (
                        <img
                          src={chat.participant.avatarUrl}
                          alt=""
                          className={style.avatar}
                        />
                      ) : (
                        <div className={style.avatarPlaceholder}>{initial}</div>
                      )}
                      <span className={style.meta}>
                        <span className={style.name}>{name}</span>
                        {chat.lastMessage?.content ? (
                          <span className={style.preview}>
                            {chat.lastMessage.content}
                          </span>
                        ) : null}
                      </span>
                      <span
                        className={[style.check, selected ? style.checkOn : ""]
                          .filter(Boolean)
                          .join(" ")}
                        aria-hidden
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className={style.footer}>
          <button
            type="button"
            className={style.cancelButton}
            onClick={onClose}
            disabled={isForwarding}
          >
            Отмена
          </button>
          <button
            type="button"
            className={style.confirmButton}
            onClick={handleConfirm}
            disabled={isForwarding || selectedChatIds.length === 0}
          >
            {isForwarding ? "Отправка..." : "Переслать"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MessageForwardModal;

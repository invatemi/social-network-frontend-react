import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGetMyFriendsQuery } from "@/entities/friend/api/friendApi";
import { useCreateChatMutation } from "@/entities/message/api/messagesApi";
import { useSocket } from "@/feature/socket/useSocket";
import style from "./CreateChatModal.module.css";

export type CreateChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated?: (chatId: number) => void;
  currentUserId: number;
};

/**
 * CreateChatModal — модальное окно создания чата
 */
const CreateChatModal = ({
  isOpen,
  onClose,
  onChatCreated,
  currentUserId,
}: CreateChatModalProps) => {
  const [isCreating, setIsCreating] = useState<Record<number, boolean>>({});
  const modalRef = useRef<HTMLDivElement>(null);

  const { data: friendsData, isLoading: isLoadingFriends } =
    useGetMyFriendsQuery();
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();

  const friends = useMemo(() => friendsData?.friends || [], [friendsData]);

  useSocket("chat:created", (data) => {
    if (data.participantIds.includes(currentUserId)) {
      onChatCreated?.(data.chatId);
      onClose();
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isCreatingChat) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, isCreatingChat, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current) modalRef.current.focus();
  }, [isOpen]);

  const handleFriendClick = async (friendId: number) => {
    if (isCreating[friendId] || isCreatingChat) return;

    setIsCreating((prev) => ({ ...prev, [friendId]: true }));

    try {
      const result = await createChat({
        participantIds: [currentUserId, friendId],
        isGroup: false,
      }).unwrap();

      onChatCreated?.(result.chatId);
      onClose();
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      setIsCreating((prev) => ({ ...prev, [friendId]: false }));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isCreatingChat) onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className={style.overlay} onClick={handleOverlayClick} role="presentation">
      <div
        ref={modalRef}
        className={style.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-chat-title"
        tabIndex={-1}
      >
        <div className={style.header}>
          <h2 id="create-chat-title" className={style.title}>
            Новый чат
          </h2>
          <button
            type="button"
            className={style.closeButton}
            onClick={() => {
              if (!isCreatingChat) onClose();
            }}
            disabled={isCreatingChat}
            aria-label="Закрыть"
          >
            ×
          </button>
        </div>

        <div className={style.content}>
          {isLoadingFriends ? (
            <div className={style.loading}>Загрузка друзей...</div>
          ) : friends.length === 0 ? (
            <div className={style.empty}>
              <p>Нет друзей для чата</p>
              <button type="button" className={style.emptyButton} onClick={onClose}>
                Закрыть
              </button>
            </div>
          ) : (
            <ul className={style.friendsList} role="listbox">
              {friends.map((friend) => {
                const isBusy = isCreating[friend.id] || isCreatingChat;
                const initial = friend.username.charAt(0).toUpperCase();

                return (
                  <li key={friend.id} className={style.friendItem} role="option">
                    <button
                      type="button"
                      className={style.friendButton}
                      onClick={() => handleFriendClick(friend.id)}
                      disabled={isBusy}
                      aria-label={`Создать чат с ${friend.username}`}
                    >
                      <div className={style.friendAvatar}>
                        {friend.avatarUrl ? (
                          <img src={friend.avatarUrl} alt="" />
                        ) : (
                          <span>{initial}</span>
                        )}
                      </div>
                      <span className={style.friendName}>{friend.username}</span>
                      {isBusy ? (
                        <span className={style.spinner}>...</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default CreateChatModal;

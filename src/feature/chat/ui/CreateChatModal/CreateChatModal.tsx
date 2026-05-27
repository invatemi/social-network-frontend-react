import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared';
import { useGetMyFriendsQuery } from '@/entities/friend/api/friendApi';
import { useCreateChatMutation } from '@/entities/message/api/messagesApi';
import { useSocket } from '@/feature/socket/useSocket';
import style from './CreateChatModal.module.css';

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
  
  const { data: friendsData, isLoading: isLoadingFriends } = useGetMyFriendsQuery();
  const [createChat, { isLoading: isCreatingChat }] = useCreateChatMutation();
  
  const friends = useMemo(() => friendsData?.friends || [], [friendsData]);

  useSocket('chat:created', (data) => {
    if (data.participantIds.includes(currentUserId)) {
      onChatCreated?.(data.chatId);
      onClose();
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCreatingChat) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isCreatingChat, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current) modalRef.current.focus();
  }, [isOpen]);

  const handleFriendClick = async (friendId: number) => {
    if (isCreating[friendId] || isCreatingChat) return;
    
    setIsCreating(prev => ({ ...prev, [friendId]: true }));
    
    try {
      const result = await createChat({
        participantIds: [currentUserId, friendId],
        isGroup: false,
      }).unwrap();
      
      onChatCreated?.(result.chatId);
      onClose();
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setIsCreating(prev => ({ ...prev, [friendId]: false }));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isCreatingChat) onClose();
  };

  const handleModalClose = () => {
    if (isCreatingChat) return;
    onClose();
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
            <span className={style.titlePrompt}>{`>`}</span>
            <span>{`new_chat`}</span>
          </h2>
          <button 
            className={style.closeButton}
            onClick={handleModalClose}
            disabled={isCreatingChat}
            aria-label="Закрыть"
          >
            {`[X]`}
          </button>
        </div>

        <div className={style.content}>
          {isLoadingFriends ? (
            <div className={style.loading}>{`[loading_friends...]`}</div>
          ) : friends.length === 0 ? (
            <div className={style.empty}>
              <p>{`// no_friends_available`}</p>
              <Button variant="primary" size="sm" onClick={onClose} className={style.emptyButton}>
                {`[close]`}
              </Button>
            </div>
          ) : (
            <ul className={style.friendsList} role="listbox">
              {friends.map((friend) => {
                const isBusy = isCreating[friend.id] || isCreatingChat;
                
                return (
                  <li key={friend.id} className={style.friendItem} role="option">
                    <button
                      className={style.friendButton}
                      onClick={() => handleFriendClick(friend.id)}
                      disabled={isBusy}
                      aria-label={`Создать чат с ${friend.username}`}
                    >
                      <div className={style.friendInfo}>
                        <span className={style.friendName}>{`@${friend.username}`}</span>
                      </div>
                      
                      {isBusy && (
                        <span className={style.spinner} aria-hidden="true">
                          {`[..]`}
                        </span>
                      )}
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
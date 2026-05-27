import { useState, useMemo } from 'react';
import { MessageCard } from '@/entities';
import { MessageSend } from '@/feature';
import { useMessageList } from '../hooks/useMessageList';
import { 
  formatMessageTime, 
  formatMessageDate, 
  shouldShowDateSeparator, 
  MessageListProps,
  UIMessageData,
} from '../lib';
import style from './MessageList.module.css';

/**
 * MessageList — список сообщений
 */
const MessageList = ({
  chatId,
  recipient,
  initialMessages = [],
  onSendMessage,
  onBack,
  className = '',
}: MessageListProps) => {
  const [messageText, setMessageText] = useState('');
  
  const {
    messages,
    isLoading,
    isLoadingMore,
    observerTarget,
    handleSendMessage: handleSendFromHook,
  } = useMessageList({
    chatId,
    initialMessages,
    onSendMessage,
  });

  const initial = recipient.username.charAt(0).toUpperCase();

  const handleSend = async (_chatId: number, text: string) => {
    await handleSendFromHook(text);
    setMessageText('');
  };

  const otherAvatarUrl = useMemo(() => 
    recipient.avatarUrl || undefined
  , [recipient.avatarUrl]);

  // ASCII-иконка пустого состояния
  const EmptyIndicator = () => <span className={style.emptyIcon}>{`[∅]`}</span>;

  if (isLoading) {
    return (
      <div className={`${style.container} ${className}`}>
        <div className={style.emptyState}>
          <span className={style.spinnerAscii}>{`[loading...]`}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${style.container} ${className}`}>
      <div className={style.header}>
        {onBack && (
          <button className={style.backButton} onClick={onBack} aria-label="Назад">
            <span className={style.iconAscii}>{`[<]`}</span>
          </button>
        )}
        
        <div className={style.avatarWrapper}>
          {recipient.avatarUrl ? (
            <img src={recipient.avatarUrl} alt={recipient.username} className={style.avatar} />
          ) : (
            <div className={style.avatarPlaceholder}>{`[${initial}]`}</div>
          )}
        </div>
        
        <div className={style.userInfo}>
          <span className={style.username}>{`@${recipient.username}`}</span>
          <span className={`${style.status} ${recipient.isOnline ? style.online : ''}`}>
            {recipient.isOnline ? `[ONLINE]` : `[OFFLINE]`}
          </span>
        </div>
      </div>

      <div className={style.messagesContainer}>
        {isLoadingMore && (
          <div className={style.loadMoreIndicator}>
            <span className={style.spinnerAscii}>{`[..]`}</span>
            <span>{`[loading_history...]`}</span>
          </div>
        )}
        
        <div ref={observerTarget} />

        {messages.length === 0 ? (
          <div className={style.emptyState}>
            <EmptyIndicator />
            <p className={style.emptyText}>{`// no_messages`}</p>
            <p className={style.emptySubtext}>{`> start_conversation`}</p>
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
                {showDateSeparator && (
                  <div className={style.dateSeparator}>
                    <span className={style.dateText}>
                      {`[${formatMessageDate(message.createdAt)}]`}
                    </span>
                  </div>
                )}

                <MessageCard
                  messageId={message.messageId}
                  sender={message.sender}
                  avatarUrl={message.sender === 'other' ? otherAvatarUrl : undefined}
                  senderName={message.senderName}
                  text={message.text}
                  timestamp={formatMessageTime(message.createdAt)}
                  isError={message.isError}
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
        placeholder={recipient ? "> enter_message..." : "// chat_unavailable"}
        maxLength={2000}
        autoFocus
      />
    </div>
  );
};

export default MessageList;
import { ReactElement, useMemo, useCallback } from 'react';
import { PageLayout } from '@/shared';
import { ChatList } from '@/widget/ChatList';
import { MessageList } from '@/widget/MessageList';
import type { UIMessageData } from '@/widget/MessageList/lib';
import { useMessagePage } from './lib/useMessagePage';
import { CreateChatButton } from '@/feature/chat';
import { useAppSelector } from '@/app/store/hooks';
import style from './MessagePage.module.css';

/**
 * MessagePage — страница мессенджера
 */
const MessagePage = (): ReactElement => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const {
    chats,
    activeChatId,
    activeChat,
    messages,
    handleChatSelect,
    handleSendMessage,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
  } = useMessagePage();

  const uiMessages = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    
    return messages.map((msg) => {
      const sender = (msg.author.id === currentUserId ? 'me' : 'other') as 'me' | 'other';
      const status = (msg.isRead ? 'read' : 'sent') as 'read' | 'sent';
      
      return {
        messageId: msg.id,
        sender,
        senderName: msg.author.username,
        avatarUrl: msg.author.avatarUrl,
        text: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString('ru-RU', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        createdAt: msg.createdAt,
        status,
        isError: false,
      } satisfies UIMessageData;
    });
  }, [messages, currentUserId]); 

  const handleSendMessageForList = useCallback(async (
    listChatId: number, 
    text: string
  ): Promise<void> => {
    if (listChatId !== activeChatId) return;
    await handleSendMessage(text);
  }, [activeChatId, handleSendMessage]);

  // ASCII-иконки вместо SVG
  const MenuIcon = () => <span className={style.iconAscii}>{`[≡]`}</span>;
  const EmptyIcon = () => <span className={style.iconLarge}>{``}</span>;

  return (
    <PageLayout 
    contentClassName={style.container}
    hideFooter={true}>
      <button
        className={style.mobileToggle}
        onClick={toggleMobileSidebar}
        aria-label="Открыть список чатов"
        aria-expanded={isMobileSidebarOpen}
      >
        <MenuIcon />
      </button>

      {isMobileSidebarOpen && (
        <div className={style.overlay} onClick={closeMobileSidebar} aria-hidden="true" />
      )}

      <aside className={`${style.sidebar} ${isMobileSidebarOpen ? style.open : ''}`}>
        <div className={style.sidebarHeader}>
          <span className={style.sidebarTitle}>{`> chats`}</span>
          <CreateChatButton 
            currentUserId={currentUserId ?? 0} 
            onChatCreated={(chatId) => {
              handleChatSelect(chatId);
              closeMobileSidebar();
            }}
            variant="ghost"
          >
            {`[+]`}
          </CreateChatButton>
        </div>
        <ChatList
          chats={chats}
          onChatSelect={handleChatSelect}
          activeChatId={activeChatId}
          className={style.chatList}
        />
      </aside>

      <main className={style.main}>
        {activeChatId && activeChat ? (
          <MessageList
            chatId={activeChatId}
            recipient={{
              userId: activeChat.participant?.userId ?? 0,
              username: activeChat.participant?.username ?? 'Собеседник',
              avatarUrl: activeChat.participant?.avatarUrl ?? null,
              isOnline: activeChat.participant?.isOnline ?? false,
            }}
            initialMessages={uiMessages}
            onSendMessage={handleSendMessageForList}
            onBack={closeMobileSidebar}
            className={style.messageList}
          />
        ) : (
          <div className={style.emptyState}>
            <EmptyIcon />
            <h1 className={style.emptyTitle}>{`// select_a_chat`}</h1>
            <p className={style.emptyText}>
              {`> choose_from_list_or_create_new`}
            </p>
          </div>
        )}
      </main>
    </PageLayout>
  );
};

export default MessagePage;
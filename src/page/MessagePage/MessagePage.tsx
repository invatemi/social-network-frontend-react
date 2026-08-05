import { ReactElement, useMemo, useCallback } from "react";
import { PageLayout } from "@/shared";
import { ChatList } from "@/widget/ChatList";
import { MessageList } from "@/widget/MessageList";
import { formatMessageForUI } from "@/widget/MessageList/lib";
import { useMessagePage } from "./lib/useMessagePage";
import { CreateChatButton } from "@/feature/chat";
import { ChatDetailsPanel } from "./ui/ChatDetailsPanel";
import { MessagesView } from "@/page/shared/MessagesView";
import { useAppSelector } from "@/app/store/hooks";
import { useGetUserPublicProfileQuery } from "@/entities/user/api";
import style from "./MessagePage.module.css";

/**
 * MessagePage — тонкая композиция мессенджера (данные → MessagesView)
 */
const MessagePage = (): ReactElement => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const {
    chats,
    activeChatId,
    activeChat,
    messages,
    handleChatSelect,
    handleCloseChat,
    handleSendMessage,
    isMobileSidebarOpen,
    closeMobileSidebar,
  } = useMessagePage(currentUserId);

  const participantId = activeChat?.participant?.userId ?? 0;
  const { data: participantProfile } = useGetUserPublicProfileQuery(
    { userId: participantId },
    { skip: !participantId }
  );

  const uiMessages = useMemo(() => {
    if (!messages || messages.length === 0 || !currentUserId) return [];
    return messages.map((msg) => formatMessageForUI(msg, currentUserId));
  }, [messages, currentUserId]);

  const handleSendMessageForList = useCallback(
    async (
      listChatId: number,
      text: string,
      files?: File[],
      options?: { replyToId?: number }
    ): Promise<void> => {
      if (listChatId !== activeChatId) return;
      await handleSendMessage(text, files, options);
    },
    [activeChatId, handleSendMessage]
  );

  const hasActiveChat = Boolean(activeChatId && activeChat);
  const presenceOnline = useAppSelector(
    (state) =>
      participantId > 0 &&
      state.presence.byUserId[String(participantId)] === true
  );

  const recipientUsername =
    participantProfile?.username ||
    activeChat?.participant?.username ||
    "Собеседник";
  const recipientAvatar =
    participantProfile?.avatarUrl ??
    activeChat?.participant?.avatarUrl ??
    null;
  const recipientEmail = participantProfile?.email ?? null;
  const recipientOnline =
    presenceOnline || (activeChat?.participant?.isOnline ?? false);

  return (
    <PageLayout
      mainClassName={style.mainLayout}
      contentClassName={style.contentFull}
      hideFooter={true}
    >
      <MessagesView
        hasActiveChat={hasActiveChat}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onCloseMobileSidebar={closeMobileSidebar}
        contentKey={activeChatId}
        sidebarHeader={
          <>
            <span className={style.sidebarTitle}>Сообщения</span>
            <CreateChatButton
              currentUserId={currentUserId ?? 0}
              variant="labeled"
              onChatCreated={(chatId) => {
                handleChatSelect(chatId);
                closeMobileSidebar();
              }}
            />
          </>
        }
        sidebarList={
          <ChatList
            chats={chats}
            onChatSelect={handleChatSelect}
            activeChatId={activeChatId}
          />
        }
        thread={
          hasActiveChat && activeChat ? (
            <MessageList
              chatId={activeChatId!}
              currentUserId={currentUserId ?? 0}
              recipient={{
                userId: activeChat.participant?.userId ?? 0,
                username: recipientUsername,
                avatarUrl: recipientAvatar,
                email: recipientEmail,
                isOnline: recipientOnline,
              }}
              initialMessages={uiMessages}
              onSendMessage={handleSendMessageForList}
              onBack={handleCloseChat}
              className={style.messageList}
            />
          ) : null
        }
        details={
          hasActiveChat && activeChat ? (
            <ChatDetailsPanel
              chatId={activeChatId!}
              userId={activeChat.participant?.userId ?? 0}
              username={recipientUsername}
              avatarUrl={recipientAvatar}
              email={recipientEmail}
              isOnline={recipientOnline}
            />
          ) : null
        }
      />
    </PageLayout>
  );
};

export default MessagePage;

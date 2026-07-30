import { ReactElement, useMemo, useCallback } from "react";
import { PageLayout } from "@/shared";
import { ChatList } from "@/widget/ChatList";
import { MessageList } from "@/widget/MessageList";
import type { UIMessageData } from "@/widget/MessageList/lib";
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
    if (!messages || messages.length === 0) return [];

    return messages.map((msg) => {
      const sender = (msg.author.id === currentUserId ? "me" : "other") as
        | "me"
        | "other";
      const status = (msg.isRead ? "read" : "sent") as "read" | "sent";

      return {
        messageId: msg.id,
        sender,
        senderName: msg.author.username,
        avatarUrl: msg.author.avatarUrl,
        text: msg.content,
        timestamp: new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        createdAt: msg.createdAt,
        status,
        isError: false,
      } satisfies UIMessageData;
    });
  }, [messages, currentUserId]);

  const handleSendMessageForList = useCallback(
    async (listChatId: number, text: string): Promise<void> => {
      if (listChatId !== activeChatId) return;
      await handleSendMessage(text);
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

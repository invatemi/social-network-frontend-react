import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetChatsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteChatMutation,
  useLazyGetMessageUploadUrlQuery,
  ChatData,
  MessageData,
} from "@/entities/message/api/messagesApi";
import { uploadMessageAttachments } from "@/feature/message/lib";
import { joinChatRoom, leaveChatRoom } from "@/app/lib/socket";
import { useSocket } from "@/feature/socket";
import { env } from "@/shared/config/env";
import { useAppSelector } from "@/app/store/hooks";
import { selectAccessToken } from "@/app/store/slices/authSlice";

export type UseMessagePageReturn = {
  chats: ChatData[];
  isLoadingChats: boolean;
  activeChatId: number | null;
  setActiveChatId: (chatId: number | null) => void;
  activeChat: ChatData | undefined;
  messages: MessageData[];
  isLoadingMessages: boolean;
  handleChatSelect: (chatId: number) => void;
  handleCloseChat: () => void;
  handleSendMessage: (
    text: string,
    files?: File[],
    options?: { replyToId?: number }
  ) => Promise<void>;
  handleLoadMessages: (before?: string) => Promise<MessageData[]>;
  handleDeleteChat: () => Promise<void>;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
};

export const useMessagePage = (
  currentUserId?: number
): UseMessagePageReturn => {
  const { chatId: chatIdParam } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  const parsedParam = chatIdParam ? Number(chatIdParam) : NaN;
  const urlChatId =
    Number.isFinite(parsedParam) && parsedParam > 0 ? parsedParam : null;

  const [activeChatId, setActiveChatId] = useState<number | null>(urlChatId);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const accessToken = useAppSelector(selectAccessToken);

  const {
    data: chats = [],
    isLoading: isLoadingChats,
    refetch: refetchChats,
  } = useGetChatsQuery({ limit: 50, offset: 0 });

  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
  } = useGetMessagesQuery(
    { chatId: activeChatId!, limit: 50 },
    {
      skip: !activeChatId,
      refetchOnMountOrArgChange: true,
    }
  );

  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [deleteChat] = useDeleteChatMutation();
  const [fetchUploadUrl] = useLazyGetMessageUploadUrlQuery();

  const activeChatIdRef = useRef(activeChatId);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    setActiveChatId(urlChatId);
  }, [urlChatId]);

  // message:new / chat:read cache patches live in app/lib/socket.ts

  useSocket(
    "chat:created",
    (data: {
      chatId: number;
      participantIds: number[];
      chatName?: string | null;
      isGroup?: boolean;
    }) => {
      void refetchChats();
      if (currentUserId && data.participantIds.includes(currentUserId)) {
        joinChatRoom(data.chatId);
      }
    }
  );

  useSocket("chat:deleted", (data: { chatId: number }) => {
    if (data.chatId === activeChatIdRef.current) {
      setActiveChatId(null);
      navigate("/messages", { replace: true });
    }
    refetchChats();
  });

  useSocket("user:left", () => {
    refetchChats();
  });

  useEffect(() => {
    if (activeChatId) {
      joinChatRoom(activeChatId);
    }
    return () => {
      if (activeChatId) {
        leaveChatRoom(activeChatId);
      }
    };
  }, [activeChatId]);

  const handleChatSelect = useCallback(
    (chatId: number) => {
      setActiveChatId(chatId);
      setIsMobileSidebarOpen(false);
      navigate(`/messages/${chatId}`);
    },
    [navigate]
  );

  const handleCloseChat = useCallback(() => {
    setActiveChatId(null);
    setIsMobileSidebarOpen(false);
    navigate("/messages");
  }, [navigate]);

  const handleSendMessage = useCallback(
    async (
      text: string,
      files?: File[],
      options?: { replyToId?: number }
    ) => {
      if (!activeChatId) return;
      const content = text.trim();
      const hasFiles = Boolean(files && files.length > 0);
      if (!content && !hasFiles) return;

      try {
        const attachments = hasFiles
          ? await uploadMessageAttachments(
              activeChatId,
              files!,
              async (args) =>
                fetchUploadUrl({
                  chatId: args.chatId,
                  contentType: args.contentType,
                  fileName: args.fileName,
                  sizeBytes: args.sizeBytes,
                }).unwrap()
            )
          : undefined;

        await sendMessage({
          chatId: activeChatId,
          content,
          attachments,
          replyToId: options?.replyToId,
        }).unwrap();
      } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
      }
    },
    [activeChatId, sendMessage, fetchUploadUrl]
  );

  const handleLoadMessages = useCallback(
    async (before?: string): Promise<MessageData[]> => {
      if (!activeChatId) return [];

      const params = new URLSearchParams({
        limit: env.messages.defaultMessageLimit.toString(),
      });
      if (before) params.append("before", before);

      try {
        const response = await fetch(
          `${env.apiUrl}/api/messages/${activeChatId}?${params}`,
          {
            credentials: "include",
            headers: {
              ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result.data || [];
      } catch (error) {
        console.error("Failed to load messages:", error);
        return [];
      }
    },
    [activeChatId, accessToken]
  );

  const handleDeleteChat = useCallback(async () => {
    if (!activeChatId) return;

    try {
      await deleteChat({ chatId: activeChatId }).unwrap();
      setActiveChatId(null);
      navigate("/messages", { replace: true });
    } catch (error) {
      console.error("Failed to delete chat:", error);
      throw error;
    }
  }, [activeChatId, deleteChat, navigate]);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen((prev) => !prev);
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
  }, []);

  const activeChat = chats.find((c) => c.chatId === activeChatId);

  return {
    chats,
    isLoadingChats,
    activeChatId,
    setActiveChatId,
    activeChat,
    messages,
    isLoadingMessages: isLoadingMessages || isFetchingMessages || isSending,
    handleChatSelect,
    handleCloseChat,
    handleSendMessage,
    handleLoadMessages,
    handleDeleteChat,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
  };
};

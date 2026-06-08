import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  useGetChatsQuery, 
  useGetMessagesQuery, 
  useSendMessageMutation,
  useDeleteChatMutation,
  ChatData,
  MessageData,
} from '@/entities/message/api/messagesApi';
import { joinChatRoom, leaveChatRoom } from '@/app/lib/socket';
import { useSocket } from '@/feature/socket';
import { env } from '@/shared/config/env';

export type UseMessagePageReturn = {
  chats: ChatData[];
  isLoadingChats: boolean;
  activeChatId: number | null;
  setActiveChatId: (chatId: number | null) => void;
  activeChat: ChatData | undefined;
  messages: MessageData[];
  isLoadingMessages: boolean;
  handleChatSelect: (chatId: number) => void;
  handleSendMessage: (text: string) => Promise<void>;
  handleLoadMessages: (before?: string) => Promise<MessageData[]>;
  handleDeleteChat: () => Promise<void>;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
};

export const useMessagePage = (currentUserId?: number): UseMessagePageReturn => {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // RTK Query
  const { 
    data: chats = [], 
    isLoading: isLoadingChats,
    refetch: refetchChats,
  } = useGetChatsQuery({ limit: 50, offset: 0 });
  
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
    isFetching: isFetchingMessages,
    refetch: refetchMessages,
  } = useGetMessagesQuery(
    { chatId: activeChatId!, limit: 50 },
    { 
      skip: !activeChatId,
      refetchOnMountOrArgChange: true
    }
  );
  
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();
  const [deleteChat] = useDeleteChatMutation();
  
  const activeChatIdRef = useRef(activeChatId);
  
  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // WebSocket: новое сообщение в активном чате
  useSocket('message:new', (message: MessageData) => {
    if (message.chatId === activeChatIdRef.current) {
      refetchMessages();
    }
    refetchChats();
  });

  //WebSocket: создан новый чат (для ОБЕИХ сторон!)
  useSocket('chat:created', (data: { 
    chatId: number; 
    participantIds: number[];
    chatName?: string | null;
    isGroup?: boolean;
  }) => {
    console.log("Received chat:created:", data);
    refetchChats();
    
    //Если текущий пользователь — участник чата, авто-присоединяемся к комнате
    if (currentUserId && data.participantIds.includes(currentUserId)) {
      joinChatRoom(data.chatId);
      
      //Опционально: авто-открываем чат, если он только что создан с нами
      // (уберите этот блок, если не хотите авто-переключение)
      if (!activeChatIdRef.current) {
        setActiveChatId(data.chatId);
      }
    }
  });

  //WebSocket: чат удалён
  useSocket('chat:deleted', (data: { chatId: number }) => {
    if (data.chatId === activeChatIdRef.current) {
      setActiveChatId(null);
    }
    refetchChats();
  });

  // WebSocket: пользователь покинул чат
  useSocket('user:left', (_data: { chatId: number; userId: number }) => {
    refetchChats(); // Обновляем список (если нужно показать, что участник ушёл)
  });

  // Подписка/отписка от комнат чатов
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

  const handleChatSelect = useCallback((chatId: number) => {
    setActiveChatId(chatId);
    setIsMobileSidebarOpen(false);
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!activeChatId || !text.trim()) return;
    
    try {
      await sendMessage({ chatId: activeChatId, content: text.trim() }).unwrap();
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      throw error;
    }
  }, [activeChatId, sendMessage]);

  const handleLoadMessages = useCallback(async (before?: string): Promise<MessageData[]> => {
    if (!activeChatId) return [];
    
    const params = new URLSearchParams({ limit: env.messages.defaultMessageLimit.toString() });
    if (before) params.append('before', before);
    
    try {
      const tokens = JSON.parse(localStorage.getItem('auth_tokens') || '{}') as {
        accessToken?: string;
      };
      
      const response = await fetch(
        `${env.apiUrl}/api/messages/${activeChatId}?${params}`,
        {
          headers: {
            ...(tokens.accessToken ? { Authorization: `Bearer ${tokens.accessToken}` } : {}),
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      return [];
    }
  }, [activeChatId]);

  const handleDeleteChat = useCallback(async () => {
    if (!activeChatId) return;
    
    try {
      await deleteChat({ chatId: activeChatId }).unwrap();
      setActiveChatId(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
      throw error;
    }
  }, [activeChatId, deleteChat]);

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
    handleSendMessage,
    handleLoadMessages,
    handleDeleteChat,
    isMobileSidebarOpen,
    toggleMobileSidebar,
    closeMobileSidebar,
  };
};
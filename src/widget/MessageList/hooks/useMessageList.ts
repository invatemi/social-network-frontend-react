import { useEffect, useRef, useState, useCallback } from 'react';
import { useInfiniteScroll } from './useInfiniteScroll';
import { 
  UseMessageListReturn, 
  UseMessageListProps, 
  UIMessageData,
} from "../lib";
import { MessageData as BackendMessageData } from '@/entities/message/api/messagesApi';
import { env } from '@/shared/config/env';

/**
 * Конвертирует сообщение из формата бэкенда в формат UI
 */
const formatMessageForUI = (
  msg: BackendMessageData, 
  currentUserId: number
): UIMessageData => ({
  messageId: msg.id,
  sender: msg.author.id === currentUserId ? 'me' : 'other',
  senderName: msg.author.username,
  text: msg.content,
  createdAt: msg.createdAt,
  timestamp: msg.createdAt,
  status: msg.isRead ? 'read' : 'sent',
  isError: false,
});

export const useMessageList = ({
  chatId,
  initialMessages = [],
  onLoadMessages,
  onSendMessage,
}: UseMessageListProps): UseMessageListReturn => {
  const currentUserId = (window as any).currentUserId || 0;
  
  const [messages, setMessages] = useState<UIMessageData[]>(() => {
    return initialMessages;
  });
  
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  const [isLoading, setIsLoading] = useState(initialMessages.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(initialMessages.length);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Загрузка сообщений через API
  useEffect(() => {
    const loadMessages = async () => {
      if (onLoadMessages && initialMessages.length === 0) {
        try {
          setIsLoading(true);
          const loaded: BackendMessageData[] = await onLoadMessages(chatId, 1);
          const formatted = loaded.map((msg) => 
            formatMessageForUI(msg, currentUserId)
          );
          
          setMessages(formatted);
          setHasMore(loaded.length === env.messages.messageListPageSize);
        } catch (error) {
          console.error('Failed to load messages:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [chatId, onLoadMessages, initialMessages.length, currentUserId]);

  // Авто-скролл при новых сообщениях
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      setTimeout(scrollToBottom, env.messages.scrollToBottomDelayMs);
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Загрузка старых сообщений
  const handleLoadMore = useCallback(async () => {
    if (!onLoadMessages || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const loaded: BackendMessageData[] = await onLoadMessages(chatId, nextPage);
      
      if (loaded.length > 0) {
        const formatted = loaded.map((msg) => 
          formatMessageForUI(msg, currentUserId)
        );
        setMessages((prev) => [...formatted, ...prev]);
        setPage(nextPage);
        setHasMore(loaded.length === env.messages.messageListPageSize);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, onLoadMessages, isLoadingMore, hasMore, page, currentUserId]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  });

  // Отправка сообщения
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!onSendMessage || !text.trim()) return;

      try {
        await onSendMessage(chatId, text.trim());
      } catch (error) {
        console.error('Failed to send message:', error);
        throw error;
      }
    },
    [chatId, onSendMessage]
  );

  return {
    messages,
    isLoading,
    isLoadingMore,
    hasMore,
    observerTarget,
    handleSendMessage,
    scrollToBottom,
  };
};
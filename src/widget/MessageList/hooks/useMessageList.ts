import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
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
  attachments: msg.attachments ?? [],
});

export const useMessageList = ({
  chatId,
  initialMessages = [],
  onLoadMessages,
  onSendMessage,
}: UseMessageListProps): UseMessageListReturn => {
  const currentUserId = (window as any).currentUserId || 0;
  
  const [messages, setMessages] = useState<UIMessageData[]>(() => initialMessages);
  const [isLoading, setIsLoading] = useState(initialMessages.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(initialMessages.length);
  const isPrependingRef = useRef(false);
  const pendingScrollRef = useRef<ScrollBehavior | null>(
    initialMessages.length > 0 ? 'auto' : null
  );

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (behavior === 'smooth') {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, []);

  // Сброс при смене чата — сразу к концу переписки
  useEffect(() => {
    prevMessagesLength.current = 0;
    isPrependingRef.current = false;
    pendingScrollRef.current = 'auto';
    setPage(1);
    setHasMore(true);
    setIsLoading(initialMessages.length === 0);
    setMessages(initialMessages);
  }, [chatId]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Загрузка сообщений через API (если нет initialMessages)
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
          pendingScrollRef.current = 'auto';
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

  // Авто-скролл до paint — пользователь сразу видит конец переписки
  useLayoutEffect(() => {
    if (isLoading || messages.length === 0) return;

    if (isPrependingRef.current) {
      isPrependingRef.current = false;
      prevMessagesLength.current = messages.length;
      return;
    }

    const lengthGrew = messages.length > prevMessagesLength.current;
    const isInitialFill = prevMessagesLength.current === 0 && messages.length > 0;
    const behavior =
      pendingScrollRef.current ??
      (isInitialFill ? 'auto' : lengthGrew ? 'smooth' : null);
    prevMessagesLength.current = messages.length;

    if (!behavior) return;

    pendingScrollRef.current = null;

    if (behavior === 'auto') {
      scrollToBottom('auto');
      // Повтор после layout панелей (grid/fade), иначе можно остаться у начала
      requestAnimationFrame(() => scrollToBottom('auto'));
      return;
    }

    const timer = window.setTimeout(() => {
      scrollToBottom('smooth');
    }, env.messages.scrollToBottomDelayMs);

    return () => window.clearTimeout(timer);
  }, [messages, isLoading, scrollToBottom]);

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
        isPrependingRef.current = true;
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

  const handleSendMessage = useCallback(
    async (text: string, files?: File[]) => {
      if (!onSendMessage) return;
      if (!text.trim() && (!files || files.length === 0)) return;

      try {
        await onSendMessage(chatId, text.trim(), files);
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
    messagesContainerRef,
    handleSendMessage,
    scrollToBottom,
  };
};

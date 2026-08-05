import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { useInfiniteScroll } from "./useInfiniteScroll";
import {
  UseMessageListReturn,
  UseMessageListProps,
  UIMessageData,
  formatMessageForUI,
} from "../lib";
import { MessageData as BackendMessageData } from "@/entities/message/api/messagesApi";
import { env } from "@/shared/config/env";

const BOTTOM_STICK_THRESHOLD_PX = 72;

const sortMessages = (list: UIMessageData[]): UIMessageData[] =>
  [...list].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    if (timeA !== timeB) return timeA - timeB;
    return a.messageId - b.messageId;
  });

const mergeWithRetained = (
  incoming: UIMessageData[],
  retained: Map<number, UIMessageData>
): UIMessageData[] => {
  if (retained.size === 0) return incoming;
  const incomingIds = new Set(incoming.map((m) => m.messageId));
  const extras = [...retained.values()].filter(
    (m) => !incomingIds.has(m.messageId)
  );
  if (extras.length === 0) return incoming;
  return sortMessages([...incoming, ...extras]);
};

export const useMessageList = ({
  chatId,
  currentUserId,
  initialMessages = [],
  localExitingIds = [],
  onLoadMessages,
  onSendMessage,
}: UseMessageListProps): UseMessageListReturn => {
  const [messages, setMessages] = useState<UIMessageData[]>(() => initialMessages);
  const [isLoading, setIsLoading] = useState(initialMessages.length === 0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pendingRemoteExitIds, setPendingRemoteExitIds] = useState<number[]>([]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(initialMessages.length);
  const isPrependingRef = useRef(false);
  const prependAnchorRef = useRef<{ scrollTop: number; scrollHeight: number } | null>(
    null
  );
  const stickToBottomRef = useRef(true);
  const pendingScrollRef = useRef<ScrollBehavior | null>(
    initialMessages.length > 0 ? "auto" : null
  );
  const bottomScrollTimersRef = useRef<number[]>([]);
  const retainedExitsRef = useRef<Map<number, UIMessageData>>(new Map());
  const localExitingIdsRef = useRef(localExitingIds);
  localExitingIdsRef.current = localExitingIds;

  const clearBottomScrollTimers = useCallback(() => {
    for (const timer of bottomScrollTimersRef.current) {
      window.clearTimeout(timer);
    }
    bottomScrollTimersRef.current = [];
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "auto") => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (behavior === "smooth") {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      return;
    }

    container.scrollTop = container.scrollHeight;
  }, []);

  const updateStickToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const gap =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const atBottom = gap <= BOTTOM_STICK_THRESHOLD_PX;
    stickToBottomRef.current = atBottom;
    if (!atBottom) {
      // User left the bottom — cancel deferred pin-to-bottom
      clearBottomScrollTimers();
      pendingScrollRef.current = null;
    }
  }, [clearBottomScrollTimers]);

  const releaseRetainedMessages = useCallback((ids: number[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);
    for (const id of ids) {
      retainedExitsRef.current.delete(id);
    }
    setPendingRemoteExitIds((prev) => prev.filter((id) => !idSet.has(id)));
    setMessages((prev) => prev.filter((m) => !idSet.has(m.messageId)));
  }, []);

  // Сброс при смене чата — сразу к концу переписки
  useEffect(() => {
    clearBottomScrollTimers();
    prevMessagesLength.current = 0;
    isPrependingRef.current = false;
    prependAnchorRef.current = null;
    stickToBottomRef.current = true;
    pendingScrollRef.current = "auto";
    retainedExitsRef.current.clear();
    setPendingRemoteExitIds([]);
    setPage(1);
    setHasMore(true);
    setIsLoading(initialMessages.length === 0);
    setMessages(initialMessages);
  }, [chatId, clearBottomScrollTimers]);

  // Синхрон с props: удалённые сообщения удерживаем для exit-анимации
  useEffect(() => {
    setMessages((prev) => {
      const incomingIds = new Set(initialMessages.map((m) => m.messageId));

      for (const id of [...retainedExitsRef.current.keys()]) {
        if (incomingIds.has(id)) {
          retainedExitsRef.current.delete(id);
        }
      }

      const newlyRemoved = prev.filter((m) => !incomingIds.has(m.messageId));
      const remoteFresh: number[] = [];

      for (const message of newlyRemoved) {
        retainedExitsRef.current.set(message.messageId, message);
        if (!localExitingIdsRef.current.includes(message.messageId)) {
          remoteFresh.push(message.messageId);
        }
      }

      if (remoteFresh.length > 0) {
        setPendingRemoteExitIds((prevIds) => [
          ...new Set([...prevIds, ...remoteFresh]),
        ]);
      }

      return mergeWithRetained(initialMessages, retainedExitsRef.current);
    });
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
          pendingScrollRef.current = "auto";
          setHasMore(loaded.length === env.messages.messageListPageSize);
        } catch (error) {
          console.error("Failed to load messages:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    void loadMessages();
  }, [chatId, onLoadMessages, initialMessages.length, currentUserId]);

  // Авто-скролл только при открытии / stick-to-bottom; prepend — якорь позиции
  useLayoutEffect(() => {
    if (isLoading || messages.length === 0) return;

    const container = messagesContainerRef.current;

    if (isPrependingRef.current) {
      isPrependingRef.current = false;
      const anchor = prependAnchorRef.current;
      prependAnchorRef.current = null;
      if (container && anchor) {
        const delta = container.scrollHeight - anchor.scrollHeight;
        container.scrollTop = anchor.scrollTop + delta;
      }
      prevMessagesLength.current = messages.length;
      return;
    }

    const lengthGrew = messages.length > prevMessagesLength.current;
    const isInitialFill =
      prevMessagesLength.current === 0 && messages.length > 0;
    const shouldFollowBottom =
      stickToBottomRef.current || pendingScrollRef.current != null;
    const behavior =
      pendingScrollRef.current ??
      (isInitialFill
        ? "auto"
        : lengthGrew && shouldFollowBottom
          ? "smooth"
          : null);
    prevMessagesLength.current = messages.length;

    if (!behavior) return;

    pendingScrollRef.current = null;
    clearBottomScrollTimers();

    if (behavior === "auto") {
      scrollToBottom("auto");
      const timer = window.setTimeout(() => {
        if (stickToBottomRef.current) scrollToBottom("auto");
      }, 220);
      bottomScrollTimersRef.current = [timer];
      return () => clearBottomScrollTimers();
    }

    if (!stickToBottomRef.current) return;

    const timer = window.setTimeout(() => {
      if (stickToBottomRef.current) scrollToBottom("smooth");
    }, env.messages.scrollToBottomDelayMs);
    bottomScrollTimersRef.current = [timer];
    return () => clearBottomScrollTimers();
  }, [messages, isLoading, scrollToBottom, clearBottomScrollTimers]);

  // Загрузка старых сообщений с сохранением якоря скролла
  const handleLoadMore = useCallback(async () => {
    if (!onLoadMessages || isLoadingMore || !hasMore) return;

    const container = messagesContainerRef.current;
    if (container) {
      prependAnchorRef.current = {
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
      };
    }

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const loaded: BackendMessageData[] = await onLoadMessages(
        chatId,
        nextPage
      );

      if (loaded.length > 0) {
        const formatted = loaded.map((msg) =>
          formatMessageForUI(msg, currentUserId)
        );
        isPrependingRef.current = true;
        stickToBottomRef.current = false;
        setMessages((prev) => [...formatted, ...prev]);
        setPage(nextPage);
        setHasMore(loaded.length === env.messages.messageListPageSize);
      } else {
        prependAnchorRef.current = null;
        setHasMore(false);
      }
    } catch (error) {
      prependAnchorRef.current = null;
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [chatId, onLoadMessages, isLoadingMore, hasMore, page, currentUserId]);

  const { observerTarget } = useInfiniteScroll({
    onLoadMore: handleLoadMore,
    hasMore,
    isLoading: isLoadingMore,
    rootRef: messagesContainerRef,
  });

  const handleSendMessage = useCallback(
    async (text: string, files?: File[], options?: { replyToId?: number }) => {
      if (!onSendMessage) return;
      if (!text.trim() && (!files || files.length === 0)) return;

      try {
        stickToBottomRef.current = true;
        await onSendMessage(chatId, text.trim(), files, options);
      } catch (error) {
        console.error("Failed to send message:", error);
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
    pendingRemoteExitIds,
    releaseRetainedMessages,
    observerTarget,
    messagesContainerRef,
    handleSendMessage,
    scrollToBottom,
    updateStickToBottom,
    stickToBottomRef,
  };
};

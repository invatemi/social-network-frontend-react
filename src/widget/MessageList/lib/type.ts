import {
  MessageData as BackendMessageData,
  ChatData as BackendChatData,
  MessageAttachmentData,
} from "@/entities/message/api/messagesApi";

/**
 *  Адаптированные данные сообщения для UI
 * (отличается от BackendMessageData структурой)
 */
export type UIMessageReplyPreview = {
  messageId: number;
  authorName: string;
  text: string;
  createdAt: string;
};

export type UIMessageData = {
  messageId: number;
  sender: "me" | "other";
  senderName?: string;
  text: string;
  createdAt: string;
  editedAt?: string | null;
  status: "sent" | "delivered" | "read" | "error";
  isError?: boolean;
  avatarUrl?: string | null;
  timestamp: any;
  attachments?: MessageAttachmentData[];
  replyTo?: UIMessageReplyPreview | null;
};

/**
 * Адаптированные данные чата для UI
 */
export type UIChatData = BackendChatData & {
  // Дополнительные поля для UI, если нужны
};

export type MessageListProps = {
  chatId: number;
  currentUserId?: number;
  recipient: {
    userId: number;
    username: string;
    avatarUrl: string | null;
    isOnline: boolean;
    email?: string | null;
  };
  initialMessages?: UIMessageData[];
  onLoadMessages?: (chatId: number, page: number) => Promise<BackendMessageData[]>;
  onSendMessage?: (
    chatId: number,
    text: string,
    files?: File[],
    options?: { replyToId?: number }
  ) => Promise<void>;
  onBack?: () => void;
  className?: string;
};

export type UseMessageListReturn = {
  messages: UIMessageData[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  /** Id сообщений, исчезнувших из props (socket/API) — нужна exit-анимация у наблюдателя */
  pendingRemoteExitIds: number[];
  releaseRetainedMessages: (ids: number[]) => void;
  observerTarget: React.RefObject<HTMLDivElement | null>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  handleSendMessage: (
    text: string,
    files?: File[],
    options?: { replyToId?: number }
  ) => Promise<void>;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  updateStickToBottom: () => void;
  stickToBottomRef: React.MutableRefObject<boolean>;
};

export type UseMessageListProps = {
  chatId: number;
  currentUserId: number;
  initialMessages?: UIMessageData[];
  /** Локальный delete уже в exit — не ставить в pendingRemoteExitIds */
  localExitingIds?: number[];
  onLoadMessages?: (chatId: number, page: number) => Promise<BackendMessageData[]>;
  onSendMessage?: (
    chatId: number,
    text: string,
    files?: File[],
    options?: { replyToId?: number }
  ) => Promise<void>;
};

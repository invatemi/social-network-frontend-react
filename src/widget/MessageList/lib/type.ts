import {
  MessageData as BackendMessageData,
  ChatData as BackendChatData,
  MessageAttachmentData,
} from "@/entities/message/api/messagesApi";

/**
 *  Адаптированные данные сообщения для UI
 * (отличается от BackendMessageData структурой)
 */
export type UIMessageData = {
  messageId: number;
  sender: "me" | "other";
  senderName?: string;
  text: string;
  createdAt: string;
  status: "sent" | "delivered" | "read" | "error";
  isError?: boolean;
  avatarUrl?: string | null;
  timestamp: any;
  attachments?: MessageAttachmentData[];
};

/**
 * Адаптированные данные чата для UI
 */
export type UIChatData = BackendChatData & {
  // Дополнительные поля для UI, если нужны
};

export type MessageListProps = {
  chatId: number;
  recipient: {
    userId: number;
    username: string;
    avatarUrl: string | null;
    isOnline: boolean;
    email?: string | null;
  };
  initialMessages?: UIMessageData[];
  onLoadMessages?: (chatId: number, page: number) => Promise<BackendMessageData[]>;
  onSendMessage?: (chatId: number, text: string, files?: File[]) => Promise<void>;
  onBack?: () => void;
  className?: string;
};

export type UseMessageListReturn = {
  messages: UIMessageData[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  observerTarget: React.RefObject<HTMLDivElement | null>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  handleSendMessage: (text: string, files?: File[]) => Promise<void>;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
};

export type UseMessageListProps = {
  chatId: number;
  initialMessages?: UIMessageData[];
  onLoadMessages?: (chatId: number, page: number) => Promise<BackendMessageData[]>;
  onSendMessage?: (chatId: number, text: string, files?: File[]) => Promise<void>;
};

import type { MessageAttachmentData } from "@/entities/message/api/messagesApi";
import type { SendMessageAttachmentInput } from "@/entities/message/api/messagesApi";

/**
 * Пропсы для компонента отправки сообщения в чате.
 *
 * @description
 * Предоставляет интерфейс для управления полем ввода и отправкой сообщения:
 * валидация, ограничение длины, состояние загрузки, обработка ошибок
 * и кастомизация через пропсы.
 */
export type MessageSendEditing = {
  messageId: number;
  text: string;
  attachments?: MessageAttachmentData[];
};

export type MessageSendReplying = {
  messageId: number;
  authorName: string;
  text: string;
};

export type MessageSaveEditPayload = {
  content: string;
  removeAttachmentIds?: number[];
  attachments?: SendMessageAttachmentInput[];
  files?: File[];
};

export type MessageSendOptions = {
  replyToId?: number;
};

export type MessageSendProps = {
  chatId: number;
  value?: string;
  onChange?: (value: string) => void;
  onSend: (
    chatId: number,
    text: string,
    files?: File[],
    options?: MessageSendOptions
  ) => Promise<void> | void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  error?: string;
  className?: string;
  autoFocus?: boolean;
  /** Вызывается при изменении высоты поля (рост/сжатие вверх) */
  onComposerHeightChange?: () => void;
  editing?: MessageSendEditing | null;
  onCancelEdit?: () => void;
  onSaveEdit?: (
    messageId: number,
    payload: MessageSaveEditPayload
  ) => Promise<void> | void;
  replying?: MessageSendReplying | null;
  onCancelReply?: () => void;
};

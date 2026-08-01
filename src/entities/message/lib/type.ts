/**
 * Определяет отправителя сообщения в интерфейсе чата.
 * - `me` — текущий авторизованный пользователь
 * - `other` — собеседник или другой участник диалога
 */
export type MessageSender = "me" | "other";

export type MessageAttachmentView = {
  id: number;
  kind: "image" | "file";
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
};

/**
 * Пропсы для компонента карточки сообщения в чате.
 *
 * @description
 * Используется для отображения отдельного сообщения с учётом отправителя,
 * статуса доставки и визуального оформления (аватар, имя, время).
 */
export type MessageCardProps = {
  messageId: number;
  sender: MessageSender;
  avatarUrl?: string | null;
  senderName?: string;
  text: string;
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  isError?: boolean;
  attachments?: MessageAttachmentView[];
};

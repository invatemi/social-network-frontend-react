import type { MessageData as BackendMessageData } from "@/entities/message/api/messagesApi";
import type { UIMessageData } from "./type";

/**
 * Конвертирует сообщение из формата бэкенда в формат UI.
 */
export const formatMessageForUI = (
  msg: BackendMessageData,
  currentUserId: number
): UIMessageData => ({
  messageId: msg.id,
  sender: msg.author.id === currentUserId ? "me" : "other",
  senderName: msg.author.username,
  avatarUrl: msg.author.avatarUrl,
  text: msg.content,
  createdAt: msg.createdAt,
  editedAt: msg.editedAt ?? null,
  timestamp: new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }),
  status: msg.isRead ? "read" : "sent",
  isError: false,
  attachments: msg.attachments ?? [],
  replyTo: msg.replyTo
    ? {
        messageId: msg.replyTo.id,
        authorName: msg.replyTo.author.username,
        text: msg.replyTo.content,
        createdAt: msg.replyTo.createdAt,
      }
    : null,
});

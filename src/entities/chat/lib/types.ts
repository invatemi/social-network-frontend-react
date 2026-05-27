/**
 * Пропсы для компонента карточки чата в списке диалогов.
 * 
 * @description
 * Используется для отображения превью чата с пользователем:
 * аватар, имя, последнее сообщение, статус онлайн и счётчик непрочитанных.
 */
export type ChatCardProps = {
  chatId: number;
  avatarUrl: string | null;
  username: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  isOnline?: boolean;
  onClick?: (chatId: number) => void;
  isActive?: boolean;
};
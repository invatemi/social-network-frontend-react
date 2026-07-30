/**
 * Пропсы для компонента карточки подписчика.
 * 
 * @description
 * Отображает базовую информацию о пользователе, который оформил подписку,
 * и предоставляет интерфейс для отправки сообщения.
 */
export type FollowerCardProps = {
  id: number;
  username: string;
  avatarUrl: string | null;
  followedSince?: string;
  onMessageClick?: (userId: number) => void;
};
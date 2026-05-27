/**
 * Статус дружбы или взаимодействия между двумя пользователями.
 * 
 * @value `none` — нет активной связи: пользователи не друзья и нет заявок
 * @value `pending` — отправлена или получена заявка в друзья, ожидает подтверждения
 * @value `friends` — пользователи подтвердили дружбу
 * @value `blocked` — один из пользователей заблокировал другого
 */
export type FriendStatus = 'none' | 'pending' | 'friends' | 'blocked';

/**
 * Запрос на добавление пользователя в друзья.
 */
export type AddFriendRequest = {
  /** Уникальный идентификатор пользователя, которому отправляется заявка */
  targetUserId: number;
};

/**
 * Ответ сервера после выполнения действия с дружбой.
 */
export type FriendActionResponse = {
  /** Флаг успешного выполнения операции */
  success: boolean;
  /** Текстовое сообщение с результатом или описанием ошибки */
  message: string;
  /** Новый статус дружбы после выполнения действия */
  newStatus: FriendStatus;
};

/**
 * Пропсы для компонента или хука управления дружбой.
 * 
 * @description
 * Используется для инициализации логики взаимодействия с пользователем:
 * отображение кнопок в зависимости от статуса, обработка действий,
 * колбэки на изменение состояния.
 */
export type CreateFriendProps = {
  targetUserId: number;
  initialStatus?: FriendStatus;
  onStatusChange?: (newStatus: FriendStatus) => void;
  className?: string;
  isRequestReceiver?: boolean;
};

/**
 * Возвращаемое значение хука `useCreateFriend`.
 * 
 * @description
 * Предоставляет состояние, обработчики действий и утилитарные методы
 * для управления дружбой и подписками в компонентах.
 */
export type UseCreateFriendReturn = {
  status: FriendStatus;
  isFollowing: boolean;
  isLoading: boolean;
  error: string | null;
  handleAddFriend: () => Promise<FriendActionResponse>;
  handleCancelRequest: () => Promise<FriendActionResponse>;
  handleRemoveFriend: () => Promise<FriendActionResponse>;
  handleAcceptRequest: () => Promise<FriendActionResponse>;
  handleDeclineRequest: () => Promise<FriendActionResponse>;
  handleUnfollow: () => Promise<FriendActionResponse>;
  refetch: () => void;
};
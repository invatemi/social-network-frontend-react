import { useEffect, useRef } from 'react';
import { getSocket } from '@/app/lib/socket';
import { FeedPost } from '@/entities/post/api/postApi';
import { SocketMessage, SocketChatEvent, SocketUserLeft, SocketChatRead } from '@/app/lib/socket';
import { env } from '@/shared/config/env';

/**
 * Уведомление, связанное с действиями дружбы между пользователями.
 */
export type FriendNotification = {
  id: number;
  type: 'friend_request' | 'friend_accepted' | 'friend_request_cancelled' | 'friend_declined' | 'friend_removed';
  fromUser: { id: number; username?: string; avatarUrl?: string | null };
  toUser: { id: number };
  createdAt: string;
  status?: 'pending' | 'accepted' | 'declined';
};

/**
 * Карта событий WebSocket и типов их данных.
 * 
 * @description
 * Используется для типизации подписок в хуке `useSocket`.
 * Ключ — имя события, значение — тип данных, передаваемых в колбэке.
 */
export type SocketEvents = {
  // Посты
  'post:created': FeedPost;
  'post:updated': FeedPost;
  'post:deleted': { postId: number };
  'post:liked': { postId: number; likesCount: number; liked: boolean; userId: number };
  
  // Комментарии
  'comment:created': { 
    id: number; 
    content: string; 
    createdAt: string; 
    postId: number;
    author: { id: number; username: string; avatarUrl: string | null };
  };
  'comment:deleted': { commentId: number; postId: number; deletedBy: number };
  
  // Друзья
  'notification:friend_request': FriendNotification & { type: 'friend_request'; status: 'pending' };
  'notification:friend_accepted': FriendNotification & { type: 'friend_accepted'; status: 'accepted' };
  'notification:friend_updated': FriendNotification & { 
    type: 'friend_request_cancelled' | 'friend_declined' | 'friend_removed';
  };
  
  // Подписки и профиль
  'notification:follow_updated': {
    id: number;
    type: 'follow_created' | 'follow_deleted';
    fromUser: { id: number };
    toUser: { id: number };
    createdAt: string;
  };
  'user:profile_updated': {
    userId: number;
    username: string;
    avatarUrl: string | null;
    changedFields: string[];
    createdAt: string;
  };

  // Фото
  'photo:created': {
    photoId: number;
    userId: number;
    url: string;
    isCurrent: boolean;
    createdAt: string;
  };
  'photo:deleted': {
    photoId: number;
    userId: number;
  };

  // Онлайн
  'user:online': { userId: number };
  'user:offline': { userId: number };
  'presence:status': { statuses: Record<string, boolean> };
  
  // Чаты
  'message:new': SocketMessage;
  'chat:deleted': SocketChatEvent;
  'chat:read': SocketChatRead;
  'user:left': SocketUserLeft;

  'chat:created': {
    chatId: number;
    chatName: string | null;
    isGroup: boolean;
    createdAt: string;
    participantIds: number[];
  };
};

/**
 * Хук для подписки на события WebSocket с автоматической очисткой и повторными попытками подключения.
 * 
 * @description
 * Предоставляет типизированный интерфейс для обработки серверных событий в реальном времени.
 * Автоматически подписывается на событие при монтировании, отписывается при размонтировании,
 * обрабатывает задержку инициализации сокета через механизм повторных попыток (до 50 раз с интервалом 100мс).
 * 
 * @template K - Ключ события из {@link SocketEvents}
 * @param event - Имя события для подписки (например, `'post:created'`)
 * @param callback - Функция-обработчик, вызываемая при получении события с типизированными данными
 * 
 * @example
 * // Подписка на создание поста
 * useSocket('post:created', (newPost) => {
 *   dispatch(postApi.util.invalidateTags(['Posts']));
 * });
 * 
 * // Подписка на заявку в друзья
 * useSocket('notification:friend_request', (notification) => {
 *   setShowNotification(true);
 * });
 * 
 * @remarks
 * - Использует `useRef` для стабильной ссылки на колбэк без перезаписи подписки
 * - Гарантирует очистку подписки при размонтировании или изменении имени события
 * - Не вызывает утечек памяти благодаря флагу `isMounted`
 */
export function useSocket<K extends keyof SocketEvents>(
  event: K, 
  callback: (data: SocketEvents[K]) => void
) {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    let isMounted = true;
    let retryCount = 0;
    
    const trySubscribe = () => {
      if (!isMounted) return null;
      
      const socket = getSocket();
      
      if (!socket) {
        if (retryCount < env.socket.subscribeMaxRetries) {
          retryCount++;
          timeout = setTimeout(trySubscribe, env.socket.subscribeRetryDelayMs);
        }
        return null;
      }

      const handler = ( data: SocketEvents[K]) => {
        if (isMounted) callbackRef.current(data);
      };
      
      socket.on(event as string, handler as ( data: unknown) => void);
      return handler;
    };
    
    const handler = trySubscribe();
    
    return () => {
      isMounted = false;
      if (timeout) clearTimeout(timeout);
      
      const socket = getSocket();
      if (socket && handler) {
        socket.off(event as string, handler as ( data: unknown) => void);
      }
    };
  }, [event]);
}
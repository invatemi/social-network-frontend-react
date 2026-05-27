import { useEffect } from 'react';
import { getSocket } from '@/app/lib/socket';

/**
 * Хук для подписки на WebSocket-события конкретного поста.
 * 
 * @description
 * Автоматически подключает компонент к комнате `post:${postId}` на сервере,
 * чтобы получать реал-тайм обновления: новые комментарии, изменения лайков,
 * удаление поста. При размонтировании компонента или изменении `postId`
 * выполняет корректную отписку.
 * 
 * @param postId - Уникальный идентификатор поста для подписки.
 *                 Если `undefined`, подписка не выполняется.
 * 
 * @returns void
 * 
 * @example
 * // Использование в компоненте поста
 * const PostPage = ({ postId }: { postId: number }) => {
 *   usePostSubscription(postId);
 *   
 *   return <PostContent postId={postId} />;
 * };
 * 
 * // Использование в списке комментариев
 * const CommentList = ({ postId }: { postId: number }) => {
 *   usePostSubscription(postId);
 *   const { comments } = useCommentList(postId);
 *   // ...
 * };
 * 
 * @remarks
 * - Требует инициализированного WebSocket-соединения через `initSocket()`
 * - Сервер должен поддерживать комнаты и события `subscribe:post` / `unsubscribe:post`
 * - Не возвращает данные — подписка работает через глобальный сокет и инвалидацию кэша RTK Query
 */
export const usePostSubscription = (postId: number | undefined) => {
  useEffect(() => {
    if (!postId) return;
    
    const socket = getSocket();
    if (!socket?.connected) return;
    
    socket.emit('subscribe:post', postId);
    
    return () => {
      socket.emit('unsubscribe:post', postId);
    };
  }, [postId]);
};
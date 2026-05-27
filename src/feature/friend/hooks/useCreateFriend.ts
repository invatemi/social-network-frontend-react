import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { 
  FriendStatus, 
  UseCreateFriendReturn 
} from "../lib";
import { 
  useFriendActionMutation, 
  useGetFriendStatusQuery,
  friendApi
} from "@/entities/friend/api";
import { userApi } from "@/entities/user/api";
import { getSocket } from "@/app/lib/socket";
import type { AppDispatch } from "@/app/store/types";

/**
 * Хук для управления статусом дружбы и подписки между пользователями.
 * 
 * @description
 * Предоставляет унифицированный интерфейс для выполнения действий с дружбой:
 * добавить, отменить, принять, отклонить, удалить, отписаться.
 * Автоматически синхронизирует кэш RTK Query, инвалидирует профили пользователей
 * и подписывается на WebSocket-уведомления для мгновенного обновления статуса.
 * 
 * @param targetUserId - Уникальный идентификатор пользователя, с которым выполняется действие
 * @param initialStatus - Начальный статус дружбы (по умолчанию `'none'`)
 * @param onStatusChange - Callback-функция, вызываемая при изменении статуса (опционально)
 * @param currentUserId - ID текущего авторизованного пользователя для точечной инвалидации кэша (опционально)
 * 
 * @returns Объект {@link UseCreateFriendReturn} с состоянием, обработчиками действий и метаданными:
 * - `status`: текущий статус дружбы (`'none' | 'pending' | 'friends'`)
 * - `isFollowing`: флаг подписки на пользователя
 * - `isLoading`: флаг загрузки (статус или действие)
 * - `error`: сообщение об ошибке или `null`
 * - `handleAddFriend`, `handleCancelRequest`, `handleAcceptRequest`, `handleDeclineRequest`, `handleRemoveFriend`, `handleUnfollow`: обработчики действий
 * - `refetch`: функция для принудительного обновления статуса
 * 
 * @example
 * const { status, isLoading, handleAddFriend, handleAcceptRequest } = useCreateFriend(targetUserId, 'none', undefined, currentUserId);
 * 
 * if (status === 'none') {
 *   return <button onClick={handleAddFriend}>Добавить в друзья</button>;
 * }
 * if (status === 'pending') {
 *   return (
 *     <>
 *       <button onClick={handleAcceptRequest}>Принять</button>
 *       <button onClick={handleCancelRequest}>Отклонить</button>
 *     </>
 *   );
 * }
 */
export const useCreateFriend = (
  targetUserId: number,
  initialStatus: FriendStatus = 'none',
  onStatusChange?: (newStatus: FriendStatus) => void,
  currentUserId?: number
): UseCreateFriendReturn => {

  const dispatch = useDispatch<AppDispatch>();

  const { 
    data: statusData, 
    isLoading: isStatusLoading,
    refetch: refetchStatus 
  } = useGetFriendStatusQuery({ userId: targetUserId }, {
    skip: !targetUserId,
    refetchOnMountOrArgChange: true,
  });

  const [friendAction, { isLoading: isActionLoading }] = useFriendActionMutation();
  
  const [error, setError] = useState<string | null>(null);
  const status = statusData?.status || initialStatus;

  useEffect(() => {
    if (statusData?.status && onStatusChange) {
      onStatusChange(statusData.status);
    }
  }, [statusData?.status, onStatusChange]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket?.connected) return;
    
    const handleFriendUpdate = ({ fromUser: { id } }: { fromUser: { id: number } }) => {
      if (id === targetUserId) {
        refetchStatus();
      }
    };
    
    socket.on('notification:friend_accepted', handleFriendUpdate);
    socket.on('notification:friend_updated', handleFriendUpdate);
    
    return () => {
      socket.off('notification:friend_accepted', handleFriendUpdate);
      socket.off('notification:friend_updated', handleFriendUpdate);
    };
  }, [targetUserId, refetchStatus]);

  const executeAction = useCallback(async (
    action: 'add' | 'cancel' | 'accept' | 'decline' | 'remove' | 'unfollow'
  ) => {
    setError(null);

    try {
      const result = await friendAction({ 
        targetUserId, 
        action 
      }).unwrap();

      if (result.success) {
        dispatch(
          friendApi.util.updateQueryData(
            "getFriendStatus",
            { userId: targetUserId },
            (draft) => {
              draft.status = result.newStatus;
              draft.friendRequestFrom = result.friendRequestFrom ?? null;
              draft.isFollowing = result.isFollowing ?? false;
            }
          )
        );
        
        if (targetUserId) {
          dispatch(userApi.util.invalidateTags([{ type: "User", id: targetUserId }]));
          dispatch(userApi.util.invalidateTags(["User"]));
          dispatch(userApi.util.invalidateTags(["UserMe"]));
        }
        
        if (currentUserId) {
          dispatch(userApi.util.invalidateTags([{ type: "User", id: currentUserId }]));
          dispatch(userApi.util.invalidateTags(["User"]));
          dispatch(userApi.util.invalidateTags(["UserMe"]));
        }
        
        setTimeout(() => {
          refetchStatus();
        }, 300);
        
        return result;
      } else {
        throw new Error(result.message);
      }

    } catch (err: any) {
      setError(err?.data?.message || err.message || "Произошла ошибка");
      throw err;
    }
  }, [targetUserId, friendAction, refetchStatus, statusData, dispatch, currentUserId]);
  
  const handleUnfollow = useCallback(() => executeAction('unfollow'), [executeAction]);
  const handleAddFriend = useCallback(() => executeAction('add'), [executeAction]);
  const handleCancelRequest = useCallback(() => executeAction('cancel'), [executeAction]);
  const handleAcceptRequest = useCallback(() => executeAction('accept'), [executeAction]);
  const handleDeclineRequest = useCallback(() => executeAction('decline'), [executeAction]);
  const handleRemoveFriend = useCallback(() => executeAction('remove'), [executeAction]);

  return {
    status,
    isFollowing: statusData?.isFollowing || false,
    isLoading: isStatusLoading || isActionLoading,
    error,
    handleAddFriend,
    handleCancelRequest,
    handleAcceptRequest,
    handleDeclineRequest,
    handleRemoveFriend,
    handleUnfollow,
    refetch: refetchStatus,
  };
};
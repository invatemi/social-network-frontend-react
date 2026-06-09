import { useState, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { 
  FriendStatus, 
  FriendActionResponse,
  UseCreateFriendReturn 
} from "../lib";
import { 
  useAcceptFriendRequestMutation,
  useFollowUserMutation,
  useGetFriendStatusQuery,
  useRemoveFriendMutation,
  useSendFriendRequestMutation,
  useUnfollowUserMutation,
  friendApi
} from "@/entities/friend/api";
import { userApi } from "@/entities/user/api";
import { useSocket } from "@/feature/socket";
import { env } from "@/shared/config/env";
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

  const [sendFriendRequest, sendFriendRequestState] = useSendFriendRequestMutation();
  const [acceptFriendRequest, acceptFriendRequestState] = useAcceptFriendRequestMutation();
  const [removeFriend, removeFriendState] = useRemoveFriendMutation();
  const [followUser, followUserState] = useFollowUserMutation();
  const [unfollowUser, unfollowUserState] = useUnfollowUserMutation();
  
  const [error, setError] = useState<string | null>(null);
  const status = statusData?.status || initialStatus;
  const isActionLoading =
    sendFriendRequestState.isLoading ||
    acceptFriendRequestState.isLoading ||
    removeFriendState.isLoading ||
    followUserState.isLoading ||
    unfollowUserState.isLoading;

  useEffect(() => {
    if (statusData?.status && onStatusChange) {
      onStatusChange(statusData.status);
    }
  }, [statusData?.status, onStatusChange]);

  useSocket('notification:friend_accepted', (data) => {
    if (data.fromUser.id === targetUserId) {
      refetchStatus();
    }
  });

  useSocket('notification:friend_updated', (data) => {
    if (data.fromUser.id === targetUserId) {
      refetchStatus();
    }
  });

  const syncFriendStatus = useCallback((result: FriendActionResponse) => {
    dispatch(
      friendApi.util.updateQueryData(
        "getFriendStatus",
        { userId: targetUserId },
        (draft) => {
          draft.status = result.newStatus;
          draft.friendRequestFrom = result.friendRequestFrom ?? null;
          draft.isFollowing = result.isFollowing ?? false;
          draft.incomingRequestId = null;
          draft.outgoingRequestId = null;
        }
      )
    );
  }, [dispatch, targetUserId]);

  const invalidateUserCaches = useCallback(() => {
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
  }, [currentUserId, dispatch, targetUserId]);

  const finishAction = useCallback((result: FriendActionResponse) => {
    if (result.success) {
      syncFriendStatus(result);
      invalidateUserCaches();

      setTimeout(() => {
        refetchStatus();
      }, env.ui.friendStatusRefetchDelayMs);
      
      return result;
    }

    throw new Error(result.message);
  }, [invalidateUserCaches, refetchStatus, syncFriendStatus]);

  const executeAction = useCallback(async (
    action: 'add' | 'cancel' | 'accept' | 'decline' | 'remove' | 'unfollow'
  ): Promise<FriendActionResponse> => {
    setError(null);

    try {
      if (action === 'add') {
        return finishAction(await sendFriendRequest({ targetUserId }).unwrap());
      }

      if (action === 'accept') {
        const requestId = statusData?.incomingRequestId ?? statusData?.friendRequestFrom;
        if (!requestId) {
          throw new Error("Не найдена входящая заявка в друзья");
        }

        return finishAction(
          await acceptFriendRequest({ requestId, targetUserId }).unwrap()
        );
      }

      if (action === 'remove') {
        return finishAction(await removeFriend({ targetUserId }).unwrap());
      }

      if (action === 'unfollow') {
        return finishAction(await unfollowUser({ targetUserId }).unwrap());
      }

      if (action === 'cancel' || action === 'decline') {
        throw new Error("Backend endpoint для отмены или отклонения заявки пока не реализован");
      }

      return finishAction(await followUser({ targetUserId }).unwrap());
    } catch (err: any) {
      setError(err?.data?.message || err.message || "Произошла ошибка");
      throw err;
    }
  }, [
    acceptFriendRequest,
    finishAction,
    followUser,
    removeFriend,
    sendFriendRequest,
    statusData?.friendRequestFrom,
    statusData?.incomingRequestId,
    targetUserId,
    unfollowUser,
  ]);
  
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
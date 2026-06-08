import { useGetUserProfileQuery, useGetUserPublicProfileQuery } from "@/entities/user/api";
import { UserProfile } from "@/entities/user/lib";
import { useGetUserFollowCountsQuery } from "@/entities/follower/api";
import { useGetFriendStatusQuery, useGetUserFriendsCountQuery } from "@/entities/friend/api";

type UseUserProfileReturn = {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  displayName: string;
  initial: string;
  isOnline?: boolean;
  isOwnProfile: boolean;
};

/**
 * Универсальный хук для загрузки профиля пользователя
 * 
 * Автоматически выбирает эндпоинт в зависимости от наличия userId:
 * - Без userId → загружает профиль текущего пользователя (/me)
 * - С userId → загружает публичный профиль другого пользователя (/:id)
 * 
 * @param userId - Опциональный ID пользователя. Если не указан, загружается профиль текущего пользователя
 * @param currentUserId - ID текущего авторизованного пользователя (для определения isOwnProfile)
 * @returns Объект с данными профиля, состояниями и утилитами для UI
 */
export const useUserProfile = (
  userId?: number,
  currentUserId?: number
): UseUserProfileReturn => {
  
  //  Определяем, свой ли это профиль
  const normalizedUserId = userId && userId > 0 ? userId : undefined;
  const isOwnProfile = !normalizedUserId || normalizedUserId === currentUserId;
  
  //  Загружаем профиль текущего пользователя (если свой профиль)
  const ownProfileQuery = useGetUserProfileQuery(undefined, {
    skip: !isOwnProfile,
  });
  
  //  Загружаем публичный профиль (если чужой профиль)
  const publicProfileQuery = useGetUserPublicProfileQuery(
    { userId: normalizedUserId! },
    { skip: isOwnProfile || !normalizedUserId }
  );

  const targetUserId = normalizedUserId ?? ownProfileQuery.data?.id;
  const followCountsQuery = useGetUserFollowCountsQuery(
    { userId: targetUserId ?? 0 },
    { skip: !targetUserId }
  );
  const friendsCountQuery = useGetUserFriendsCountQuery(
    { userId: targetUserId ?? 0 },
    { skip: !targetUserId }
  );
  const relationQuery = useGetFriendStatusQuery(
    { userId: normalizedUserId ?? 0 },
    { skip: isOwnProfile || !normalizedUserId }
  );
  
  //  Выбираем результат в зависимости от типа профиля
  const query = isOwnProfile ? ownProfileQuery : publicProfileQuery;
  
  const { 
    data: user, 
    isLoading: loading, 
    isError, 
    error: queryError, 
    refetch 
  } = query;

  const profile = user
    ? {
        ...user,
        followersCount: followCountsQuery.data?.followersCount ?? user.followersCount ?? 0,
        followingCount: friendsCountQuery.data?.friendsCount ?? user.friendsCount ?? user.followingCount ?? 0,
        friendsCount: friendsCountQuery.data?.friendsCount ?? user.friendsCount,
        friendStatus: relationQuery.data?.status ?? user.friendStatus,
        friendRequestFrom: relationQuery.data?.friendRequestFrom ?? user.friendRequestFrom,
      }
    : null;

  const displayName = profile?.username || "Пользователь";
  const initial = displayName.charAt(0).toUpperCase();
  
  //  isOnline есть только в публичном профиле, для своего профиля по умолчанию false
  const isOnline = profile?.isOnline ?? false;
  
  const error = isError 
    ? (queryError as any)?.message || "Ошибка загрузки профиля" 
    : null;

  return {
    user: profile,
    loading: loading || followCountsQuery.isLoading || friendsCountQuery.isLoading,
    error,
    refetch: () => {
      refetch();
      if (targetUserId) {
        followCountsQuery.refetch();
        friendsCountQuery.refetch();
      }
      if (!isOwnProfile && normalizedUserId) {
        relationQuery.refetch();
      }
    },
    displayName,
    initial,
    isOnline,
    isOwnProfile,
  };
};
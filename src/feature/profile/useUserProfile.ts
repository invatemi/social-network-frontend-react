import { useGetUserProfileQuery, useGetUserPublicProfileQuery } from "@/entities/user/api";
import { UserProfile } from "@/entities/user/lib";

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
  const isOwnProfile = !userId || userId === currentUserId;
  
  //  Загружаем профиль текущего пользователя (если свой профиль)
  const ownProfileQuery = useGetUserProfileQuery(undefined, {
    skip: !isOwnProfile,
  });
  
  //  Загружаем публичный профиль (если чужой профиль)
  const publicProfileQuery = useGetUserPublicProfileQuery(
    { userId: userId! },
    { skip: isOwnProfile || !userId }
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

  const displayName = user?.username || "Пользователь";
  const initial = displayName.charAt(0).toUpperCase();
  
  //  isOnline есть только в публичном профиле, для своего профиля по умолчанию false
  const isOnline = user?.isOnline ?? false;
  
  const error = isError 
    ? (queryError as any)?.message || "Ошибка загрузки профиля" 
    : null;

  return {
    user: user || null,
    loading,
    error,
    refetch,
    displayName,
    initial,
    isOnline,
    isOwnProfile,
  };
};
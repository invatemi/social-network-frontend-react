import { useGetMyFriendsQuery, useGetUserFriendsQuery } from "@/entities/friend/api";

/**
 * Хук для получения списка друзей
 * 
 * Динамически выбирает запрос в зависимости от контекста:
 * - Свои друзья (если userId не передан)
 * - Друзья конкретного пользователя (если userId передан)
 * 
 * @param userId - ID пользователя (опционально, для просмотра чужого профиля)
 * @returns Объект со списком друзей, общим количеством, статусом загрузки, ошибкой и refetch
 */
export const useGetFriends = (userId?: number) => {
  const isPublic = !!userId;
  
  // Выбор RTK Query хука в зависимости от контекста (свой профиль или чужой)
  const query = isPublic 
    ? useGetUserFriendsQuery({ userId }) 
    : useGetMyFriendsQuery();

  const { data, isLoading, error, refetch } = query;

  return {
    friends: data?.friends || [],
    total: data?.total || 0,
    isLoading,
    error: error ? "Не удалось загрузить список друзей" : null,
    refetch,
  };
};
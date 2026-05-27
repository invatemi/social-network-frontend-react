import { useGetMyFollowersQuery, useGetUserFollowersQuery } from "@/entities/follower/api";

/**
 * Хук для получения списка подписчиков
 * 
 * Динамически выбирает запрос в зависимости от контекста:
 * - Свои подписчики (если userId не передан)
 * - Подписчики конкретного пользователя (если userId передан)
 * 
 * @param userId - ID пользователя (опционально, для просмотра чужого профиля)
 * @returns Объект со списком подписчиков, общим количеством, статусом загрузки, ошибкой и refetch
 */
export const useGetFollowers = (userId?: number) => {
  const isPublic = !!userId;
  const query = isPublic 
    ? useGetUserFollowersQuery({ userId }) 
    : useGetMyFollowersQuery();

  const { data, isLoading, error, refetch } = query;

  return {
    followers: data?.followers || [],
    total: data?.total || 0,
    isLoading,

    error: error ? "Не удалось загрузить список подписчиков" : null,
    refetch,
  };
};
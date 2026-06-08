import { useCallback, useEffect, useState } from "react";
import { useGetMyFollowersQuery, useGetUserFollowersQuery } from "@/entities/follower/api";
import type { FollowerEntity } from "@/entities/follower/api/followerApi";

const DEFAULT_LIMIT = 20;

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
  const [cursor, setCursor] = useState<string | null>(null);
  const [followers, setFollowers] = useState<FollowerEntity[]>([]);
  const isPublic = !!userId;
  const myFollowersQuery = useGetMyFollowersQuery(
    { limit: DEFAULT_LIMIT, cursor },
    { skip: isPublic }
  );
  const userFollowersQuery = useGetUserFollowersQuery(
    { userId: userId ?? 0, limit: DEFAULT_LIMIT, cursor },
    { skip: !isPublic }
  );

  const query = isPublic ? userFollowersQuery : myFollowersQuery;
  const { data, isLoading, isFetching, error, refetch } = query;

  useEffect(() => {
    setCursor(null);
    setFollowers([]);
  }, [userId]);

  useEffect(() => {
    if (!data?.followers) return;

    setFollowers((current) => {
      if (!cursor) return data.followers;

      const knownIds = new Set(current.map((follower) => follower.id));
      const nextItems = data.followers.filter((follower) => !knownIds.has(follower.id));
      return [...current, ...nextItems];
    });
  }, [cursor, data?.followers]);

  const loadMore = useCallback(() => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  }, [data?.nextCursor]);

  return {
    followers,
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    loadMore,
    isLoading,
    isFetching,

    error: error ? "Не удалось загрузить список подписчиков" : null,
    refetch,
  };
};
import { useCallback, useEffect, useState } from "react";
import { useGetMyFriendsQuery, useGetUserFriendsQuery } from "@/entities/friend/api";
import type { FriendEntity } from "@/entities/friend/api/friendApi";

const DEFAULT_LIMIT = 20;

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
  const [cursor, setCursor] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendEntity[]>([]);
  const isPublic = !!userId;
  const myFriendsQuery = useGetMyFriendsQuery(
    { limit: DEFAULT_LIMIT, cursor },
    { skip: isPublic }
  );
  const userFriendsQuery = useGetUserFriendsQuery(
    { userId: userId ?? 0, limit: DEFAULT_LIMIT, cursor },
    { skip: !isPublic }
  );

  const query = isPublic ? userFriendsQuery : myFriendsQuery;
  const { data, isLoading, isFetching, error, refetch } = query;

  useEffect(() => {
    setCursor(null);
    setFriends([]);
  }, [userId]);

  useEffect(() => {
    if (!data?.friends) return;

    setFriends((current) => {
      if (!cursor) return data.friends;

      const knownIds = new Set(current.map((friend) => friend.id));
      const nextItems = data.friends.filter((friend) => !knownIds.has(friend.id));
      return [...current, ...nextItems];
    });
  }, [cursor, data?.friends]);

  const loadMore = useCallback(() => {
    if (data?.nextCursor) {
      setCursor(data.nextCursor);
    }
  }, [data?.nextCursor]);

  return {
    friends,
    total: data?.total || 0,
    hasMore: data?.hasMore || false,
    loadMore,
    isLoading,
    isFetching,
    error: error ? "Не удалось загрузить список друзей" : null,
    refetch,
  };
};
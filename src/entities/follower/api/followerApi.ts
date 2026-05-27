import { baseApi } from "@/app/store/api/baseApi";

/**
 * Представляет пользователя, подписанного на другого пользователя.
 */
export type FollowerEntity = {
  id: number;
  username: string;
  avatarUrl: string | null;
  followedSince: string;
};

/**
 * Структура ответа API со списком подписчиков.
 */
export type FollowersResponse = {
  followers: FollowerEntity[];
  total: number;
};

/**
 * API-эндпоинты для работы с подписчиками (followers).
 */
export const followersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Получает список подписчиков текущего авторизованного пользователя.
     * @returns Объект со списком подписчиков и общим количеством
     */
    getMyFollowers: builder.query<FollowersResponse, void>({
      query: () => "/api/users/me/followers",
      providesTags: ["User"],
    }),

    /**
     * Получает список подписчиков указанного пользователя по ID.
     * @param userId - Уникальный идентификатор пользователя
     * @returns Объект со списком подписчиков и общим количеством
     */
    getUserFollowers: builder.query<FollowersResponse, { userId: number }>({
      query: ({ userId }) => `/api/users/${userId}/followers`,
      providesTags: ["User"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetMyFollowersQuery, useGetUserFollowersQuery } = followersApi;
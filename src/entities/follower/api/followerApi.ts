import { baseApi } from "@/app/store/api/baseApi";

type UserSummaryDto = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
};

type FollowerDto = UserSummaryDto & {
  followedAt: string;
};

type FollowersDtoResponse = {
  success?: boolean;
  followers: FollowerDto[];
  total: number;
  nextCursor?: string | null;
};

export type UserListPaginationParams = {
  limit?: number;
  cursor?: string | null;
};

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
  nextCursor?: string | null;
  hasMore: boolean;
};

export type FollowCountsResponse = {
  followersCount: number;
  followingCount: number;
};

const mapFollower = (follower: FollowerDto): FollowerEntity => ({
  id: follower.id,
  username: follower.name,
  avatarUrl: follower.avatarUrl,
  followedSince: follower.followedAt,
});

const mapFollowersResponse = (response: FollowersDtoResponse): FollowersResponse => ({
  followers: response.followers.map(mapFollower),
  total: response.total,
  nextCursor: response.nextCursor ?? null,
  hasMore: Boolean(response.nextCursor),
});

const withPaginationParams = ({ limit, cursor }: UserListPaginationParams = {}) => ({
  ...(limit ? { limit } : {}),
  ...(cursor ? { cursor } : {}),
});

/**
 * API-эндпоинты для работы с подписчиками (followers).
 */
export const followersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Получает список подписчиков текущего авторизованного пользователя.
     * @returns Объект со списком подписчиков и общим количеством
     */
    getMyFollowers: builder.query<FollowersResponse, UserListPaginationParams | void>({
      query: (params) => ({
        url: "/api/users/me/followers",
        params: withPaginationParams(params || undefined),
      }),
      transformResponse: mapFollowersResponse,
      providesTags: ["User"],
    }),

    /**
     * Получает список подписчиков указанного пользователя по ID.
     * @param userId - Уникальный идентификатор пользователя
     * @returns Объект со списком подписчиков и общим количеством
     */
    getUserFollowers: builder.query<
      FollowersResponse,
      { userId: number } & UserListPaginationParams
    >({
      query: ({ userId, ...params }) => ({
        url: `/api/users/${userId}/followers`,
        params: withPaginationParams(params),
      }),
      transformResponse: mapFollowersResponse,
      providesTags: ["User"],
    }),

    getUserFollowCounts: builder.query<FollowCountsResponse, { userId: number }>({
      query: ({ userId }) => `/api/users/${userId}/counts`,
      transformResponse: (response: FollowCountsResponse & { success?: boolean }) => ({
        followersCount: response.followersCount,
        followingCount: response.followingCount,
      }),
      providesTags: (_result, _error, { userId }) => [{ type: "User" as const, id: userId }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyFollowersQuery,
  useGetUserFollowersQuery,
  useGetUserFollowCountsQuery,
} = followersApi;
import { baseApi } from "@/app/store/api/baseApi";
import { Post, PostListResponse } from "@/entities/post/lib";
import { env } from "@/shared/config/env";

type PostAuthorDto = {
  id: number;
  username: string;
  avatarUrl: string | null;
};

type PostDto = {
  id: number;
  userId: number;
  content: string;
  imageUrl?: string | null;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isPublished?: boolean;
  author?: PostAuthorDto;
};

type PostsListDto = {
  success?: boolean;
  posts: PostDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const mapPostDto = (post: PostDto): Post => ({
  id: post.id,
  content: post.content,
  images: post.imageUrl ? [post.imageUrl] : [],
  likesCount: post.likesCount,
  commentsCount: post.commentsCount,
  createdAt: post.createdAt,
  isPublished: post.isPublished,
  author: post.author ?? {
    id: post.userId,
    username: `user_${post.userId}`,
    avatarUrl: null,
  },
});

const mapPostsListResponse = (response: PostsListDto): PostListResponse => ({
  posts: (response.posts ?? []).map(mapPostDto),
  pagination: {
    page: response.page,
    limit: response.pageSize,
    total: response.total,
    pages: response.totalPages,
  },
});

/**
 * Представляет автора поста в ленте.
 */
export type FeedPostAuthor = { 
  id: number; 
  username: string; 
  avatarUrl: string | null; 
};

/**
 * Структура поста в ленте новостей.
 */
export type FeedPost = {
  id: number;
  author: FeedPostAuthor;
  title?: string;
  content: string;
  imageUrl?: string;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLiked?: boolean;
};

/**
 * Структура ответа API для получения ленты постов.
 */
export type FeedResponse = {
  posts: FeedPost[];
  hasMore: boolean;
};

/**
 * API-эндпоинты для работы с постами: создание, получение, лайки, удаление.
 */
export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Создаёт новый пост с возможностью загрузки изображений.
     * @param formData - Объект FormData с полями поста и файлами
     * @returns Объект с ID созданного поста и сообщением об успехе
     */
    createPost: builder.mutation<{ id: number; message: string }, FormData>({
      query: (formData) => ({
        url: "/api/posts",
        method: "POST",
        body: formData,
        headers: {},
      }),
      invalidatesTags: ["Posts", "User"],
    }),
    
    /**
     * Получает список постов с пагинацией и фильтрацией по пользователю.
     * @param page - Номер страницы (по умолчанию 1)
     * @param limit - Количество постов на странице (по умолчанию 10)
     * @param userId - ID пользователя для фильтрации (опционально)
     * @returns Объект `PostListResponse` со списком постов и метаданными
     */
    getPosts: builder.query<
      PostListResponse,
      { page?: number; limit?: number; userId?: number; isOwnProfile?: boolean }
    >({
      query: ({ page = 1, limit = 10, userId, isOwnProfile }) => {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: limit.toString(),
        });

        if (isOwnProfile) {
          return `/api/posts/me?${params}`;
        }

        if (userId) {
          return `/api/posts/user/${userId}?${params}`;
        }

        return `/api/posts?${params}`;
      },
      transformResponse: mapPostsListResponse,
      providesTags: (result) => 
        result 
          ? [
              ...result.posts.map(({ id }) => ({ type: "Posts" as const, id })),
              { type: "Posts" as const, id: "LIST" },
            ]
          : [{ type: "Posts" as const, id: "LIST" }],
    }),

    /**
     * Удаляет пост по его идентификатору.
     * @param postId - Уникальный идентификатор удаляемого поста
     * @returns Объект с сообщением об успехе
     */
    deletePost: builder.mutation<{ message: string }, number>({
      query: (postId) => ({ url: `/api/posts/${postId}`, method: "DELETE" }),
      invalidatesTags: ["Posts", "User"],
    }),
    
    /**
     * Переключает состояние лайка для указанного поста.
     * @param postId - Уникальный идентификатор поста
     * @returns Объект с новым состоянием лайка и обновлённым счётчиком
     */
    toggleLike: builder.mutation<
      { liked: boolean; likesCount: number }, 
      { postId: number }
    >({
      query: ({ postId }) => ({
        url: `/api/posts/${postId}/like`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { postId }) => [{ type: "Posts", id: postId }],
    }),

    /**
     * Получает персонализированную ленту постов.
     * @param limit - Количество постов (по умолчанию 20)
     * @param offset - Смещение для пагинации (по умолчанию 0)
     * @returns Объект `FeedResponse` со списком постов и флагом `hasMore`
     */
    getFeedPosts: builder.query<FeedResponse, { limit?: number; offset?: number }>({
      query: ({ limit = env.posts.defaultFeedLimit, offset = 0 }) => `/api/posts/feed?limit=${limit}&offset=${offset}`,
      providesTags: (result) => 
        result 
          ? [...result.posts.map(({ id }) => ({ type: "Posts" as const, id })), "Feed"] 
          : ["Feed"],
      keepUnusedDataFor: env.posts.feedCacheSeconds, 
    }),
    
    /**
     * Получает посты от пользователей, на которых подписан текущий пользователь.
     * @param limit - Количество постов (по умолчанию 20)
     * @param offset - Смещение для пагинации (по умолчанию 0)
     * @returns Объект `FeedResponse` со списком постов и флагом `hasMore`
     */
    getPostsFromFollowers: builder.query<FeedResponse, { limit?: number; offset?: number }>({
      query: ({ limit = env.posts.defaultFeedLimit, offset = 0 }) => `/api/posts/from-followers?limit=${limit}&offset=${offset}`,
      providesTags: (result) => 
        result ? [...result.posts.map(({ id }) => ({ type: "Posts" as const, id })), "Posts"] : ["Posts"],
      keepUnusedDataFor: env.posts.feedCacheSeconds,
    }),

    /**
     * Получает посты от пользователей, на которых подписан текущий пользователь (альтернативный эндпоинт).
     * @param limit - Количество постов (по умолчанию 20)
     * @param offset - Смещение для пагинации (по умолчанию 0)
     * @returns Объект `FeedResponse` со списком постов и флагом `hasMore`
     */
    getPostsFromFollowing: builder.query<FeedResponse, { limit?: number; offset?: number }>({
      query: ({ limit = env.posts.defaultFeedLimit, offset = 0 }) => `/api/posts/from-following?limit=${limit}&offset=${offset}`,
      providesTags: (result) => 
        result ? [...result.posts.map(({ id }) => ({ type: "Posts" as const, id })), "Posts"] : ["Posts"],
      keepUnusedDataFor: env.posts.feedCacheSeconds,
    }),

    /**
     * Получает посты от друзей текущего пользователя.
     * @param limit - Количество постов (по умолчанию 20)
     * @param offset - Смещение для пагинации (по умолчанию 0)
     * @returns Объект `FeedResponse` со списком постов и флагом `hasMore`
     */
    getPostsFromFriends: builder.query<FeedResponse, { limit?: number; offset?: number }>({
      query: ({ limit = env.posts.defaultFeedLimit, offset = 0 }) => `/api/posts/from-friends?limit=${limit}&offset=${offset}`,
      providesTags: (result) => 
        result ? [...result.posts.map(({ id }) => ({ type: "Posts" as const, id })), "Posts"] : ["Posts"],
      keepUnusedDataFor: env.posts.feedCacheSeconds,
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreatePostMutation,
  useGetPostsQuery,
  useDeletePostMutation,
  useToggleLikeMutation,
  useGetFeedPostsQuery,
  useGetPostsFromFollowersQuery,
  useGetPostsFromFollowingQuery,
  useGetPostsFromFriendsQuery,
} = postApi;
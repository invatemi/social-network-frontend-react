import { useState, useCallback } from "react";
import { useGetPostsQuery, useToggleLikeMutation } from "@/entities/post/api";
import { useAppSelector } from "@/app/store/hooks";
import { selectUser } from "@/app/store/slices/authSlice";

/**
 * Хук для управления списком постов пользователя с пагинацией и лайками.
 * 
 * @description
 * Предоставляет состояние и методы для загрузки постов указанного пользователя
 * (или текущего авторизованного), обработки пагинации и взаимодействия с лайками.
 * Интегрирован с RTK Query для кэширования и автоматической инвалидации данных.
 * 
 * @param userId - Уникальный идентификатор пользователя, чьи посты загружаются.
 *                 Если не передан, используется `id` текущего авторизованного пользователя.
 * 
 * @returns Объект с состоянием и методами управления:
 * - `posts`: массив загруженных постов или пустой массив
 * - `pagination`: метаданные пагинации или `null`
 * - `isLoading`: флаг загрузки данных
 * - `isError`: флаг ошибки запроса
 * - `error`: текст ошибки или `null`
 * - `loadMore`: функция для загрузки следующей страницы постов
 * - `likePost`: асинхронная функция для переключения лайка поста
 * 
 * @example
 * const { posts, isLoading, loadMore, likePost } = usePostList(targetUserId);
 * 
 * // Рендер списка постов
 * {posts.map(post => (
 *   <PostCard 
 *     key={post.id} 
 *     post={post} 
 *     onLike={likePost}
 *     currentUserId={currentUserId}
 *   />
 * ))}
 * 
 * // Кнопка "Загрузить ещё"
 * {pagination?.hasMore && (
 *   <Button onClick={loadMore} disabled={isLoading}>
 *     Загрузить ещё
 *   </Button>
 * )}
 */
export const usePostList = (userId?: number) => {
  const currentUser = useAppSelector(selectUser);
  const currentUserId = userId || currentUser?.id;
  const [page, setPage] = useState(1);

  const { 
    data, 
    isLoading, 
    isError, 
    error: queryError 
  } = useGetPostsQuery(
    { 
      userId: currentUserId,
      page,
      limit: 5
    }, 
    { skip: !currentUserId }
  );
  const [toggleLike] = useToggleLikeMutation();

  const error = isError 
    ? (queryError as any)?.message || "Ошибка загрузки постов" 
    : null;
  
  /**
   * Загружает следующую страницу постов при наличии доступных данных.
   * Обновляет состояние `page`, что инициирует новый запрос через `useGetPostsQuery`.
   */
  const loadMore = useCallback(() => {
    if (data?.pagination && page < data.pagination.pages) {
      setPage((prev) => prev + 1);
    }
  }, [page, data?.pagination]);
  
  /**
   * Переключает состояние лайка для указанного поста.
   * @param postId - Уникальный идентификатор поста
   * @returns Promise<void>
   */
  const likePost = useCallback(async (postId: number) => {
    try {
      await toggleLike({ postId }).unwrap();
    } catch {
      // Ошибка лайка обрабатывается на уровне компонента или глобального error boundary
    }
  }, [toggleLike]);
  
  return {
    posts: data?.posts || [],
    pagination: data?.pagination || null,
    isLoading,
    isError,
    error,
    loadMore,
    likePost,
  };
};
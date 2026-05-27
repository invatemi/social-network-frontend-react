import { useGetCommentsQuery } from "@/entities/comment/api";

/**
 * Хук для получения списка комментариев к посту.
 * 
 * @description
 * Обёртка над `useGetCommentsQuery` с безопасной обработкой опционального `postId`
 * и нормализацией возвращаемых данных. Автоматически пропускает запрос,
 * если `postId` не передан.
 * 
 * @param postId - Уникальный идентификатор поста, к которому загружаются комментарии (опционально)
 * @returns Объект с состоянием запроса и данными:
 * - `comments`: массив комментариев или пустой массив, если данные не загружены
 * - `isLoading`: флаг выполнения запроса
 * - `isError`: флаг ошибки запроса
 * - `error`: текст ошибки или `null`, если ошибок нет
 * 
 * @example
 * const { comments, isLoading, error } = useCommentList(postId);
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage text={error} />;
 * 
 * return (
 *   <CommentList>
 *     {comments.map(comment => <CommentItem key={comment.id} {...comment} />)}
 *   </CommentList>
 * );
 */
export const useCommentList = (postId?: number) => {
  const { data, isLoading, isError, error } = useGetCommentsQuery(
    { postId: postId! },
    { 
      skip: !postId,
    }
  );

  return {
    comments: data?.comments || [],
    isLoading,
    isError,
    error: isError ? (error as any)?.message || "Ошибка загрузки комментариев" : null,
  };
};
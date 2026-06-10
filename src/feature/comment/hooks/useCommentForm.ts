import { useState, useCallback } from "react";
import { useCreateCommentMutation } from "@/entities/comment/api";

/**
 * Хук для управления состоянием и отправкой формы комментария.
 * 
 * @description
 * Предоставляет состояние поля ввода, обработку отправки, валидацию,
 * обработку ошибок и интеграцию с мутацией `createComment` из RTK Query.
 * 
 * @param postId - Уникальный идентификатор поста, к которому добавляется комментарий (опционально, но рекомендуется)
 * @returns Объект с состоянием формы и методами управления:
 * - `content`: текущее значение текстового поля
 * - `setContent`: функция для обновления значения
 * - `handleSubmit`: асинхронная функция отправки комментария
 * - `isLoading`: флаг выполнения мутации
 * - `error`: сообщение об ошибке или `null`
 * 
 * @example
 * const { content, setContent, handleSubmit, isLoading, error } = useCommentForm(postId);
 * 
 * <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
 *   <textarea value={content} onChange={(e) => setContent(e.target.value)} />
 *   {error && <span className="error">{error}</span>}
 *   <button type="submit" disabled={isLoading}>Отправить</button>
 * </form>
 */
export const useCommentForm = (postId?: number) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [createComment, { isLoading }] = useCreateCommentMutation();

  const handleSubmit = useCallback(async () => {
    if (!postId) {
      setError("Ошибка: ID поста не указан");
      return;
    }
    
    if (!content.trim()) {
      setError("Комментарий не может быть пустым");
      return;
    }

    try {
      setError(null);
      await createComment({ postId, content }).unwrap();
      setContent("");
    } catch (err: unknown) {
      const data = (err as { data?: { error?: { message?: string }; message?: string } }).data;
      const message =
        data?.error?.message ?? data?.message ?? "Не удалось отправить комментарий";
      setError(message);
    }
  }, [content, postId, createComment]);

  return {
    content,
    setContent,
    handleSubmit,
    isLoading,
    error,
  };
};
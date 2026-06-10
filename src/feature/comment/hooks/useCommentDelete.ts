import { useState, useCallback } from "react";
import { useDeleteCommentMutation } from "@/entities/comment/api";

export type UseCommentDeleteReturn = {
  handleDelete: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
};

export const useCommentDelete = (
  { commentId, postId }: { commentId: number; postId: number }
): UseCommentDeleteReturn => {
  const [error, setError] = useState<string | null>(null);
  const [deleteComment, { isLoading }] = useDeleteCommentMutation();

  const resetError = useCallback(() => setError(null), []);

  const handleDelete = useCallback(async () => {
    if (!commentId || !postId) {
      setError("Ошибка: не указан ID комментария или поста");
      return;
    }

    try {
      setError(null);
      await deleteComment({ commentId, postId }).unwrap();
    } catch (err) {
      const error = err as {
        data?: { error?: { message?: string; code?: string }; message?: string; code?: string };
        message?: string;
      };
      const code = error?.data?.error?.code ?? error?.data?.code;

      let message = "Не удалось удалить комментарий";
      if (code === "FORBIDDEN") message = "Нет прав на удаление этого комментария";
      else if (code === "COMMENT_NOT_FOUND") message = "Комментарий уже удалён или не существует";
      else if (code === "COMMENT_POST_MISMATCH") message = "Ошибка: комментарий не принадлежит этому посту";
      else if (error?.data?.error?.message) message = error.data.error.message;
      else if (error?.data?.message) message = error.data.message;

      setError(message);
    }
  }, [commentId, postId, deleteComment]);

  return {
    handleDelete,
    isLoading,
    error,
    resetError,
  };
};
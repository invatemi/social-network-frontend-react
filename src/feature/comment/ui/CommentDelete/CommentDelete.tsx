import { useState, useCallback } from "react";
import { Button } from "@/shared";
import { useCommentDelete } from "../../hooks";
import style from "./CommentDelete.module.css";

type CommentDeleteProps = {
  commentId: number;
  postId: number;
  onSuccess?: () => void;
};

const CommentDelete = ({
  commentId,
  postId,
  onSuccess,
}: CommentDeleteProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  const { handleDelete, isLoading, error, resetError } = useCommentDelete({
    commentId,
    postId,
  });

  const handleConfirm = useCallback(async () => {
    const ok = await handleDelete();
    if (ok) {
      setShowConfirm(false);
      onSuccess?.();
    }
  }, [handleDelete, onSuccess]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    resetError();
  }, [resetError]);

  if (showConfirm) {
    return (
      <div className={style.confirmPanel} role="dialog" aria-label="Подтверждение удаления">
        <p className={style.confirmText}>Удалить комментарий?</p>

        {error && (
          <p className={style.errorMessage} role="alert">
            {error}
          </p>
        )}

        <div className={style.confirmActions}>
          <Button
            variant="danger"
            size="sm"
            loading={isLoading}
            onClick={handleConfirm}
            className={style.confirmBtn}
          >
            Да, удалить
          </Button>

          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={handleCancel}
            className={style.cancelBtn}
          >
            Отмена
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      loading={isLoading}
      onClick={() => {
        resetError();
        setShowConfirm(true);
      }}
      className={style.deleteButton}
      aria-label="Удалить комментарий"
      title="Удалить комментарий"
    >
      Удалить
    </Button>
  );
};

export default CommentDelete;

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
  onSuccess 
}: CommentDeleteProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const { 
    handleDelete, 
    isLoading, 
    error, 
    resetError 
  } = useCommentDelete({ commentId, postId });

  const handleConfirm = useCallback(async () => {
    await handleDelete();
    if (!error) {
      setShowConfirm(false);
      onSuccess?.();
    }
  }, [handleDelete, error, onSuccess]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    resetError();
  }, [resetError]);

  // ASCII-иконки
  const ICONS = {
    trash: "[🗑]",
    cross: "[×]",
    warning: "[!]",
    check: "[✓]",
  };

  if (showConfirm) {
    return (
      <div className={style.container}>
        <div className={style.confirmBox}>
          <p className={style.confirmText}>
            {ICONS.warning} Удалить комментарий? {ICONS.warning}
          </p>
          
          {error && (
            <div className={style.errorAscii} role="alert">
              <span className={style.errorIcon}>{ICONS.cross}</span>
              <span className={style.errorMessage}>{error}</span>
            </div>
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
      {ICONS.trash}
    </Button>
  );
};

export default CommentDelete;
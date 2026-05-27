import { useCallback } from "react";
import { CommentCard } from "@/entities";
import { CommentForm } from "@/feature";
import { commentApi } from "@/entities/comment/api/commentApi";
import { useCommentList } from "../hooks/useCommentList";
import { usePostSubscription } from "@/shared/hooks";
import { useAppSelector } from "@/app/store/hooks";
import { useAppDispatch } from "@/app/store/hooks";
import style from "./CommentList.module.css";

type CommentListProps = {
  postId: number;
};

/**
 * CommentList — список комментариев
 */
const CommentList = ({ postId }: CommentListProps) => {
  usePostSubscription(postId);
  const dispatch = useAppDispatch();
  const { comments, isLoading, isError, error } = useCommentList(postId);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const handleDeleteSuccess = useCallback((deletedCommentId: number) => {
    dispatch(
      commentApi.util.updateQueryData('getComments', { postId }, (draft) => {
        draft.comments = draft.comments.filter((c) => c.id !== deletedCommentId);
      })
    );

    console.log(`[✓] Комментарий #${deletedCommentId} удалён`);
    
  }, [dispatch, postId]);

  if (isLoading) {
    return (
      <div className={style.loading}>
        <span className={style.spinnerAscii}>{`[loading...]`}</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={style.error}>
        <p>{`! ${error}`}</p>
        <button onClick={() => window.location.reload()} className={style.retryBtn}>
          {`[retry]`}
        </button>
      </div>
    );
  }

  return (
    <section className={style.commentList}>
      <h3 className={style.title}>
        <span className={style.prompt}>{`>`}</span>
        <span>{`comments`}</span>
        <span className={style.count}>{`[${comments.length}]`}</span>
      </h3>

      <div className={style.list}>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentCard 
              key={comment.id}
              isOwner={comment.author.id === currentUserId}
              comment={comment}
              onDeleteSuccess={() => handleDeleteSuccess(comment.id)} />
          ))
        ) : (
          <div className={style.empty}>
            <p>{`// no_comments_yet`}</p>
          </div>
        )}
      </div>

      <CommentForm postId={postId} />
    </section>
  );
};

export default CommentList;
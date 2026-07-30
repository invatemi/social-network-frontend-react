import { CommentCardProps } from "../lib";
import { CommentDelete } from "@/feature/comment";
import { useAppSelector } from "@/app/store/hooks";
import style from "./CommentCard.module.css";

/**
 * CommentCard — карточка комментария
 */
const CommentCard = ({
  comment,
  isOwner = false,
  onDeleteSuccess,
}: CommentCardProps) => {
  const isOnline = useAppSelector(
    (state) => state.presence.byUserId[String(comment.author.id)] === true
  );

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const initial = comment.author.username.charAt(0).toUpperCase();

  return (
    <article className={style.commentCard}>
      <div className={style.avatarWrapper}>
        {comment.author.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt={comment.author.username}
            className={style.avatar}
          />
        ) : (
          <div className={style.avatarPlaceholder}>{initial}</div>
        )}
        <span
          className={[style.onlineDot, isOnline ? style.online : style.offline]
            .filter(Boolean)
            .join(" ")}
          aria-label={isOnline ? "Онлайн" : "Офлайн"}
          title={isOnline ? "Онлайн" : "Офлайн"}
        />
      </div>

      <div className={style.content}>
        <div className={style.topRow}>
          <span className={style.username}>{comment.author.username}</span>
          {isOwner && (
            <CommentDelete
              commentId={comment.id}
              postId={comment.postId}
              onSuccess={onDeleteSuccess}
            />
          )}
        </div>

        <p className={style.text}>{comment.content}</p>
        <time className={style.date}>{formatTime(comment.createdAt)}</time>
      </div>
    </article>
  );
};

export default CommentCard;

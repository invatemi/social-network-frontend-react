import { CommentCardProps } from "../lib";
import { CommentDelete } from "@/feature/comment";
import style from "./CommentCard.module.css";

/**
 * CommentCard — карточка комментария
 */
const CommentCard = ({ 
  comment, 
  isOwner = false, 
  onDeleteSuccess 
}: CommentCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const initial = comment.author.username.charAt(0).toUpperCase();

  return (
    <article className={style.commentCard}>
      <header className={style.commentHeader}>
        <div className={style.avatarWrapper}>
          {comment.author.avatarUrl ? (
            <img src={comment.author.avatarUrl} alt={comment.author.username} className={style.avatar} />
          ) : (
            <div className={style.avatarPlaceholder}>{`[${initial}]`}</div>
          )}
        </div>

        <div className={style.authorInfo}>
          <span className={style.username}>{`@${comment.author.username}`}</span>
          <time className={style.date}>{`[${formatDate(comment.createdAt)}]`}</time>
        </div>

        {/* Кнопка удаления (только для владельца) */}
        {isOwner && (
          <div className={style.actionWrapper}>
            <CommentDelete
              commentId={comment.id}
              postId={comment.postId}
              onSuccess={onDeleteSuccess}
            />
          </div>
        )}
      </header>

      <div className={style.commentBody}>
        <p>{`> ${comment.content}`}</p>
      </div>

      {/* ASCII-разделитель (появляется только если есть действия) */}
      {isOwner && <div className={style.divider}>╰───────────────────────────╯</div>}
    </article>
  );
};

export default CommentCard;
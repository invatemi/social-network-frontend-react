import { useNavigate } from "react-router-dom";
import { PostCardProps } from "../lib";
import { Button } from "@/shared";
import { useToggleLikeMutation } from "@/entities/post/api/postApi";
import { usePostSubscription } from "@/shared/hooks/usePostSubscription";
import style from "./PostCard.module.css";

/**
 * PostCard — карточка поста
 */
const PostCard = ({ post, onLike, currentUserId, onDelete }: PostCardProps) => {
  const navigate = useNavigate();
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeMutation();

  usePostSubscription(post?.id ?? 0);

  if (!post?.author) {
    return null;
  }

  const isAuthor = currentUserId === post.author.id;
  
  const images = post.images || [];
  const isLiked = post.isLiked || false;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenComments = () => {
    navigate(`/post/${post.id}/comments`);
  };

  const handleAuthorClick = () => {
    if (post.author.id !== currentUserId) {
      navigate(`/user/${post.author.id}`);
    }
  };

  const handleLike = () => {
    if (!currentUserId) return;
    if (onLike) {
      onLike(post.id);
    } else {
      toggleLike({ postId: post.id });
    }
  };

  // ASCII-иконки вместо SVG
  const DeleteIcon = () => <span className={style.iconAscii}>{`[DEL]`}</span>;
  const HeartIcon = ({ filled }: { filled?: boolean }) => (
    <span className={`${style.iconAscii} ${filled ? style.liked : ''}`}>
      {filled ? `[♥]` : `[♡]`}
    </span>
  );
  const CommentIcon = () => <span className={style.iconAscii}>{`[CMT]`}</span>;

  return (
    <article className={style.postCard}>
      <header className={style.postHeader}>
        <div className={style.authorInfo} onClick={handleAuthorClick}>
          <div className={style.avatarWrapper}>
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt={post.author.username} className={style.authorAvatar} />
            ) : (
              <div className={style.authorAvatarPlaceholder}>
                {`[${post.author.username.charAt(0).toUpperCase()}]`}
              </div>
            )}
          </div>
          <div className={style.authorDetails}>
            <span className={style.authorName}>{`@${post.author.username}`}</span>
            <time className={style.postDate}>{`[${formatDate(post.createdAt)}]`}</time>
          </div>
        </div>

        {isAuthor && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("Удалить этот пост?")) {
                onDelete(post.id);
              }
            }}
            aria-label="Удалить пост"
            title="Удалить пост"
            className={style.deleteButton}
            leftIcon={<DeleteIcon />}
          />
        )}
      </header>

      {post.content && (
        <div className={style.postContent}>
          <p className={style.postText}>{post.content}</p>
        </div>
      )}

      {images.length > 0 && (
        <div className={style.postGallery}>
          {images.length === 1 ? (
            <img src={images[0]} alt="Post attachment" className={style.postImageSingle} />
          ) : (
            <div className={style.postImageGrid}>
              {images.slice(0, 4).map((img, index) => (
                <img key={index} src={img} alt={`Post ${index}`} className={style.postImageGridItem} />
              ))}
              {images.length > 4 && (
                <div className={style.postImageMore}>{`[+${images.length - 4}]`}</div>
              )}
            </div>
          )}
        </div>
      )}

      <footer className={style.postFooter}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking || !currentUserId}
          aria-label={isLiked ? "Убрать лайк" : "Поставить лайк"}
          className={`${style.actionButton} ${isLiked ? style.liked : ''}`}
          leftIcon={<HeartIcon filled={isLiked} />}
        >
          {`[likes:${post.likesCount}]`}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleOpenComments}
          aria-label="Открыть комментарии"
          className={style.actionButton}
          leftIcon={<CommentIcon />}
        >
          {`[cmts:${post.commentsCount}]`}
        </Button>
      </footer>
    </article>
  );
};

export default PostCard;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PostCardProps } from "../lib";
import { Button } from "@/shared";
import { CommentList } from "@/widget/CommentList";
import { useToggleLikeMutation } from "@/entities/post/api/postApi";
import { usePostSubscription } from "@/shared/hooks/usePostSubscription";
import { CommentIcon, LikeIcon, RepostIcon } from "./icons";
import RollingCount from "./RollingCount";
import style from "./PostCard.module.css";

/**
 * PostCard — карточка поста с комментариями
 */
const PostCard = ({ post, onLike, currentUserId, onDelete }: PostCardProps) => {
  const navigate = useNavigate();
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [likeBurst, setLikeBurst] = useState(false);
  const [toggleLike, { isLoading: isLiking }] = useToggleLikeMutation();

  usePostSubscription(post?.id ?? 0);

  useEffect(() => {
    if (!likeBurst) return;
    const timer = window.setTimeout(() => setLikeBurst(false), 320);
    return () => window.clearTimeout(timer);
  }, [likeBurst]);

  if (!post?.author) {
    return null;
  }

  const isAuthor = currentUserId === post.author.id;
  const images = post.images || [];
  const isLiked = post.isLiked || false;

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleAuthorClick = () => {
    if (post.author.id !== currentUserId) {
      navigate(`/user/${post.author.id}`);
    }
  };

  const handleLike = () => {
    if (!currentUserId || isLiking) return;
    if (!isLiked) {
      setLikeBurst(true);
    }
    if (onLike) {
      onLike(post.id);
    } else {
      toggleLike({ postId: post.id });
    }
  };

  return (
    <article className={style.postCard}>
      <header className={style.postHeader}>
        <div
          className={style.authorInfo}
          onClick={handleAuthorClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleAuthorClick();
            }
          }}
          role="button"
          tabIndex={0}
        >
          <div className={style.avatarWrapper}>
            {post.author.avatarUrl ? (
              <img
                src={post.author.avatarUrl}
                alt={post.author.username}
                className={style.authorAvatar}
              />
            ) : (
              <div className={style.authorAvatarPlaceholder}>
                {post.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className={style.authorDetails}>
            <span className={style.authorName}>@{post.author.username}</span>
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
          >
            Удалить
          </Button>
        )}
      </header>

      {images.length > 0 && (
        <div className={style.postGallery}>
          {images.length === 1 ? (
            <img src={images[0]} alt="Вложение поста" className={style.postImageSingle} />
          ) : (
            <div className={style.postImageGrid}>
              {images.slice(0, 4).map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Вложение ${index + 1}`}
                  className={style.postImageGridItem}
                />
              ))}
              {images.length > 4 && (
                <div className={style.postImageMore}>{`+${images.length - 4}`}</div>
              )}
            </div>
          )}
        </div>
      )}

      {post.content && (
        <div className={style.postContent}>
          <p className={style.postText}>{post.content}</p>
        </div>
      )}

      <footer className={style.postFooter}>
        <div className={style.actions}>
          <button
            type="button"
            className={`${style.iconButton} ${commentsExpanded ? style.iconButtonActive : ""}`}
            onClick={() => setCommentsExpanded((prev) => !prev)}
            aria-label="Комментарии"
            aria-expanded={commentsExpanded}
          >
            <CommentIcon />
            <RollingCount value={post.commentsCount} />
          </button>

          <button
            type="button"
            className={style.iconButton}
            aria-label="Репост"
            title="Репост"
          >
            <RepostIcon />
          </button>

          <button
            type="button"
            className={[
              style.iconButton,
              isLiked ? style.liked : "",
              likeBurst ? style.likeBurst : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleLike}
            disabled={isLiking || !currentUserId}
            aria-label={isLiked ? "Убрать лайк" : "Поставить лайк"}
          >
            <span className={style.likeIconWrap}>
              <LikeIcon filled={isLiked || likeBurst} className={style.likeIcon} />
            </span>
            <RollingCount value={post.likesCount} />
          </button>
        </div>

        <time className={style.footerTime}>{formatTime(post.createdAt)}</time>
      </footer>

      <div
        className={[
          style.commentsSection,
          style.commentsSectionToggle,
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button, a, input, textarea, [role='dialog']")) return;
          setCommentsExpanded((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          const target = e.target as HTMLElement;
          if (target.closest("button, a, input, textarea, [role='dialog']")) return;
          e.preventDefault();
          setCommentsExpanded((prev) => !prev);
        }}
        role="button"
        tabIndex={0}
        aria-expanded={commentsExpanded}
        aria-label={commentsExpanded ? "Скрыть комментарии" : "Открыть комментарии"}
      >
        <CommentList
          postId={post.id}
          expanded={commentsExpanded}
        />
      </div>
    </article>
  );
};

export default PostCard;

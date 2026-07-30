import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import type { PhotoItem } from "@/entities/photo";
import {
  useCreatePhotoCommentMutation,
  useDeletePhotoCommentMutation,
  useDeletePhotoMutation,
  useGetPhotoCommentsQuery,
  useTogglePhotoLikeMutation,
} from "@/entities/photo";
import { LikeIcon, CommentIcon, SendIcon } from "@/entities/post/ui/icons";
import RollingCount from "@/entities/post/ui/RollingCount";
import { useAppSelector } from "@/app/store/hooks";
import { Spinner } from "@/shared";
import style from "./PhotoModal.module.css";

export type PhotoModalProps = {
  photos: PhotoItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  canDelete?: boolean;
  ownerName?: string;
  ownerAvatarUrl?: string | null;
};

/**
 * PhotoModal — полноэкранный просмотр фото с лайками и комментариями
 */
const PhotoModal = ({
  photos,
  index,
  onClose,
  onIndexChange,
  canDelete = false,
  ownerName,
  ownerAvatarUrl,
}: PhotoModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const gradientId = useId().replace(/:/g, "");
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const photo = photos[index];

  const [commentText, setCommentText] = useState("");
  const [likeBurst, setLikeBurst] = useState(false);
  const [localLiked, setLocalLiked] = useState(photo?.isLiked ?? false);
  const [localLikes, setLocalLikes] = useState(photo?.likesCount ?? 0);

  const { data: comments = [], isLoading: commentsLoading } =
    useGetPhotoCommentsQuery(photo?.id ?? 0, { skip: !photo });
  const [toggleLike, { isLoading: isLiking }] = useTogglePhotoLikeMutation();
  const [createComment, { isLoading: isSending }] =
    useCreatePhotoCommentMutation();
  const [deleteComment] = useDeletePhotoCommentMutation();
  const [deletePhoto, { isLoading: isDeleting }] = useDeletePhotoMutation();

  useEffect(() => {
    if (!photo) return;
    setLocalLiked(photo.isLiked ?? false);
    setLocalLikes(photo.likesCount ?? 0);
    setCommentText("");
  }, [photo?.id, photo?.isLiked, photo?.likesCount]);

  useEffect(() => {
    if (!likeBurst) return;
    const timer = window.setTimeout(() => setLikeBurst(false), 320);
    return () => window.clearTimeout(timer);
  }, [likeBurst]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft" && index > 0) {
        onIndexChange(index - 1);
      }
      if (e.key === "ArrowRight" && index < photos.length - 1) {
        onIndexChange(index + 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [index, photos.length, onClose, onIndexChange]);

  if (!photo) {
    return null;
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const handleLike = async () => {
    if (!currentUserId || isLiking) return;
    if (!localLiked) setLikeBurst(true);
    setLocalLiked((prev) => !prev);
    setLocalLikes((prev) => Math.max(0, prev + (localLiked ? -1 : 1)));
    try {
      const result = await toggleLike({ photoId: photo.id }).unwrap();
      setLocalLiked(result.liked);
      setLocalLikes(result.likesCount);
    } catch {
      setLocalLiked(photo.isLiked ?? false);
      setLocalLikes(photo.likesCount ?? 0);
    }
  };

  const handleSubmitComment = async (e: FormEvent) => {
    e.preventDefault();
    const content = commentText.trim();
    if (!content || isSending) return;
    try {
      await createComment({ photoId: photo.id, content }).unwrap();
      setCommentText("");
    } catch {
      /* keep text for retry */
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm("Удалить комментарий?")) return;
    await deleteComment({ photoId: photo.id, commentId });
  };

  const handleDeletePhoto = async () => {
    if (!window.confirm("Удалить это фото?")) return;
    try {
      await deletePhoto(photo.id).unwrap();
      if (photos.length <= 1) {
        onClose();
        return;
      }
      onIndexChange(Math.min(index, photos.length - 2));
    } catch {
      /* keep modal open */
    }
  };

  const hasPrev = index > 0;
  const hasNext = index < photos.length - 1;
  const displayName = ownerName ?? "Пользователь";
  const initial = displayName.charAt(0).toUpperCase();

  return createPortal(
    <div
      className={style.overlay}
      onClick={onClose}
      data-testid="photo-modal-overlay"
    >
      <div
        ref={dialogRef}
        className={style.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Просмотр фотографии"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        data-testid="photo-modal"
      >
        <div className={style.mediaPane}>
          {hasPrev && (
            <button
              type="button"
              className={[style.navBtn, style.navPrev].join(" ")}
              onClick={() => onIndexChange(index - 1)}
              aria-label="Предыдущее фото"
            >
              ‹
            </button>
          )}
          <img src={photo.url} alt="" className={style.image} />
          {hasNext && (
            <button
              type="button"
              className={[style.navBtn, style.navNext].join(" ")}
              onClick={() => onIndexChange(index + 1)}
              aria-label="Следующее фото"
            >
              ›
            </button>
          )}
        </div>

        <aside className={style.sidePane}>
          <header className={style.sideHeader}>
            <div className={style.owner}>
              {ownerAvatarUrl ? (
                <img
                  src={ownerAvatarUrl}
                  alt=""
                  className={style.ownerAvatar}
                />
              ) : (
                <div className={style.ownerAvatarPlaceholder}>{initial}</div>
              )}
              <div className={style.ownerMeta}>
                <span className={style.ownerName}>{displayName}</span>
                <time className={style.date}>{formatDate(photo.createdAt)}</time>
              </div>
            </div>
            {canDelete && (
              <button
                type="button"
                className={style.deletePhotoBtn}
                onClick={handleDeletePhoto}
                disabled={isDeleting}
              >
                Удалить
              </button>
            )}
          </header>

          <div className={style.actions}>
            <button
              type="button"
              className={[
                style.actionBtn,
                localLiked ? style.liked : "",
                likeBurst ? style.likeBurst : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={handleLike}
              disabled={isLiking || !currentUserId}
              aria-label={localLiked ? "Убрать лайк" : "Поставить лайк"}
            >
              <LikeIcon filled={localLiked || likeBurst} />
              <RollingCount value={localLikes} />
            </button>
            <div className={style.actionBtn} aria-hidden>
              <CommentIcon />
              <RollingCount value={comments.length} />
            </div>
          </div>

          <div className={style.comments} data-testid="photo-comments">
            {commentsLoading && (
              <div className={style.commentsLoading}>
                <Spinner />
              </div>
            )}
            {!commentsLoading && comments.length === 0 && (
              <p className={style.commentsEmpty}>Пока нет комментариев</p>
            )}
            {!commentsLoading &&
              comments.map((comment) => {
                const isOwner =
                  currentUserId === comment.userId ||
                  currentUserId === photo.userId;
                return (
                  <article key={comment.id} className={style.comment}>
                    <div className={style.commentAvatarWrap}>
                      {comment.author.avatarUrl ? (
                        <img
                          src={comment.author.avatarUrl}
                          alt=""
                          className={style.commentAvatar}
                        />
                      ) : (
                        <div className={style.commentAvatarPlaceholder}>
                          {comment.author.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className={style.commentBody}>
                      <div className={style.commentTop}>
                        <span className={style.commentAuthor}>
                          {comment.author.username}
                        </span>
                        {isOwner && (
                          <button
                            type="button"
                            className={style.commentDelete}
                            onClick={() => handleDeleteComment(comment.id)}
                            aria-label="Удалить комментарий"
                          >
                            Удалить
                          </button>
                        )}
                      </div>
                      <p className={style.commentText}>{comment.content}</p>
                    </div>
                  </article>
                );
              })}
          </div>

          <form className={style.commentForm} onSubmit={handleSubmitComment}>
            <div className={style.inputBar}>
              <input
                className={style.input}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Комментарий"
                disabled={isSending || !currentUserId}
                maxLength={2000}
                aria-label="Текст комментария"
              />
              <button
                type="submit"
                className={style.sendButton}
                disabled={isSending || !commentText.trim() || !currentUserId}
                aria-label="Отправить комментарий"
              >
                <SendIcon gradientId={gradientId} className={style.sendIcon} />
              </button>
            </div>
          </form>
        </aside>
      </div>
    </div>,
    document.body
  );
};

export default PhotoModal;

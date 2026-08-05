import { useCallback, useRef } from "react";
import { PostCard } from "@/entities/post";
import { useAppSelector } from "@/app/store/hooks";
import { selectUser } from "@/app/store/slices/authSlice";
import { useDeletePostMutation } from "@/entities/post/api";
import { Button } from "@/shared";
import { useWindowedRange } from "@/shared/hooks";
import { usePostList } from "../hooks/usePostList";
import { PostListProps } from "../lib";
import style from "./PostList.module.css";

const POST_ROW_ESTIMATE_PX = 360;
const POST_WINDOW_OVERSCAN = 3;

/**
 * PostList — список постов
 */
const PostList = ({
  userId,
  isOwnProfile,
  title = "",
  posts: externalPosts,
  isLoading: externalLoading,
  hasMore,
  onLoadMore,
  onLike: externalOnLike,
}: PostListProps) => {
  const isControlled = externalPosts !== undefined;
  const listRef = useRef<HTMLDivElement>(null);

  const {
    posts: internalPosts,
    pagination,
    isLoading: internalLoading,
    isError,
    error,
    loadMore,
    likePost,
  } = usePostList(userId, isOwnProfile);

  const posts = isControlled ? externalPosts : internalPosts;
  const isLoading = isControlled ? externalLoading || false : internalLoading;
  const shouldShowPagination = isControlled
    ? hasMore
    : pagination && pagination.page < pagination.pages;
  const handleLoadMore = isControlled ? onLoadMore : loadMore;
  const handleLike = isControlled ? externalOnLike : likePost;

  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.id;

  const [deletePostMutation] = useDeletePostMutation();

  const handleDeletePost = useCallback(
    async (postId: number) => {
      try {
        await deletePostMutation(postId).unwrap();
      } catch (err) {
        console.error("Delete post error:", err);
      }
    },
    [deletePostMutation]
  );

  const handleLikeStable = useCallback(
    (postId: number) => {
      handleLike?.(postId);
    },
    [handleLike]
  );

  const windowed = useWindowedRange(
    listRef,
    posts.length,
    POST_ROW_ESTIMATE_PX,
    POST_WINDOW_OVERSCAN,
    "window"
  );

  if (!isControlled && isLoading && posts.length === 0) {
    return (
      <div className={style.loading}>
        <span>Загрузка...</span>
      </div>
    );
  }

  if (!isControlled && isError) {
    return (
      <div className={style.error}>
        <p>{error || "Ошибка загрузки"}</p>
        <Button type="button" onClick={() => window.location.reload()}>
          Повторить
        </Button>
      </div>
    );
  }

  if (!isControlled && posts.length === 0) {
    return (
      <div className={style.empty}>
        <p className={style.emptyTitle}>Постов пока нет</p>
        <p className={style.hint}>Создайте первый пост</p>
      </div>
    );
  }

  const visiblePosts = posts.slice(windowed.start, windowed.end);

  return (
    <section className={style.postListSection}>
      {title && <h2 className={style.title}>{title}</h2>}

      <div ref={listRef} className={style.postsContainer}>
        {windowed.topSpacer > 0 ? (
          <div aria-hidden style={{ height: windowed.topSpacer }} />
        ) : null}
        {visiblePosts.map((post) => (
          <div key={post.id} className={style.postRow}>
            <PostCard
              post={post}
              onLike={handleLikeStable}
              onDelete={handleDeletePost}
              currentUserId={currentUserId}
            />
          </div>
        ))}
        {windowed.bottomSpacer > 0 ? (
          <div aria-hidden style={{ height: windowed.bottomSpacer }} />
        ) : null}
      </div>

      {shouldShowPagination && !isLoading && handleLoadMore && (
        <Button
          type="button"
          fullWidth
          className={style.loadMoreButton}
          onClick={handleLoadMore}
        >
          Загрузить ещё
        </Button>
      )}
    </section>
  );
};

export default PostList;

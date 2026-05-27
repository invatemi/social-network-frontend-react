import { PostCard } from "@/entities/post";
import { useAppSelector } from "@/app/store/hooks";
import { selectUser } from "@/app/store/slices/authSlice";
import { useDeletePostMutation } from "@/entities/post/api";
import { usePostList } from "../hooks/usePostList";
import { PostListProps } from "../lib";
import style from "./PostList.module.css";

/**
 * PostList — список постов
 */
const PostList = ({ 
  userId, 
  title = "", 
  posts: externalPosts, 
  isLoading: externalLoading, 
  hasMore, 
  onLoadMore, 
  onLike: externalOnLike 
}: PostListProps) => {

  const isControlled = externalPosts !== undefined;

  const { 
    posts: internalPosts, 
    pagination, 
    isLoading: internalLoading, 
    isError, 
    error, 
    loadMore, 
    likePost 
  } = usePostList(userId);

  const posts = isControlled ? externalPosts : internalPosts;
  const isLoading = isControlled ? (externalLoading || false) : internalLoading;
  const shouldShowPagination = isControlled ? hasMore : (pagination && pagination.page < pagination.pages);
  const handleLoadMore = isControlled ? onLoadMore : loadMore;
  const handleLike = isControlled ? externalOnLike : likePost;

  const currentUser = useAppSelector(selectUser);
  const currentUserId = currentUser?.id;
  
  const [deletePostMutation] = useDeletePostMutation();

  const handleDeletePost = async (postId: number) => {
    try {
      await deletePostMutation(postId).unwrap();
    } catch (err) {
      console.error("Delete post error:", err);
    }
  };

  if (!isControlled && isLoading && posts.length === 0) {
    return (
      <div className={style.loading}>
        <span className={style.spinnerAscii}>{`[loading...]`}</span>
      </div>
    );
  }

  if (!isControlled && isError) {
    return (
      <div className={style.error}>
        <p>{`! ${error}`}</p>
        <button onClick={() => window.location.reload()} className={style.retryBtn}>
          {`[retry]`}
        </button>
      </div>
    );
  }

  if (!isControlled && posts.length === 0) {
    return (
      <div className={style.empty}>
        <p>{`// no_posts`}</p>
        <p className={style.hint}>{`> create_first_post`}</p>
      </div>
    );
  }

  return (
    <section className={style.postListSection}>
      {title && (
        <h2 className={style.title}>
          <span className={style.prompt}>{`>`}</span>
          <span>{title}</span>
        </h2>
      )}
      
      <div className={style.postsContainer}>
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post} 
            onLike={handleLike}
            onDelete={handleDeletePost}
            currentUserId={currentUserId}
          />
        ))}
      </div>

      {shouldShowPagination && !isLoading && handleLoadMore && (
        <button className={style.loadMoreButton} onClick={handleLoadMore}>
          {`[load_more]`}
        </button>
      )}
    </section>
  );
};

export default PostList;
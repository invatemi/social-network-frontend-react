import { ReactElement, useState } from "react";
import { PageLayout } from "@/shared";
import { PostList } from "@/widget";
import { useGetFeedPostsQuery } from "@/entities/post/api";
import style from "./MainPage.module.css";

/**
 * MainPage — главная лента
 */
const MainPage = (): ReactElement => {
  const [page, setPage] = useState(0);
  const { data, isLoading, error, refetch, isFetching } = useGetFeedPostsQuery({
    limit: 20,
    offset: page * 20,
  });

  const handleLoadMore = () => {
    if (data?.hasMore && !isFetching) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <PageLayout
      isLoading={isLoading}
      error={error ? "! feed_load_error" : null}
      onRetry={refetch}
      hideFooter={true}
    >
      <div className={style.feedContainer}>
        {!isLoading && (!data || data.posts.length === 0) && (
          <div className={style.empty}>
            <span className={style.emptyIcon}>{`[∅]`}</span>
            <p>{`// feed_is_empty`}</p>
            <span className={style.emptyHint}>
              {`> follow_users_or_add_friends`}
            </span>
          </div>
        )}

        {data && data.posts.length > 0 && (
          <PostList 
            posts={data.posts} 
            isLoading={isFetching}
            hasMore={data.hasMore}
            onLoadMore={handleLoadMore}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default MainPage;
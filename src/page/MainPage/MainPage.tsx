import { ReactElement, useState } from "react";
import { PageLayout } from "@/shared";
import { PostList } from "@/widget";
import { useGetFeedPostsQuery } from "@/entities/post/api";
import { env } from "@/shared/config/env";
import style from "./MainPage.module.css";

const FEED_PAGE_SIZE = env.posts.defaultFeedLimit;

/**
 * MainPage — главная лента
 */
const MainPage = (): ReactElement => {
  const [page, setPage] = useState(1);
  const { data, isLoading, error, refetch, isFetching } = useGetFeedPostsQuery({
    page,
    pageSize: FEED_PAGE_SIZE,
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
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
      error={error ? "Не удалось загрузить ленту" : null}
      onRetry={refetch}
      hideFooter={true}
      mainClassName={style.main}
      contentClassName={style.container}
    >
      <div className={style.feedContainer}>
        <h1 className={style.feedTitle}>Лента новостей</h1>

        {!isLoading && (!data || data.posts.length === 0) && (
          <div className={style.empty}>
            <p className={style.emptyTitle}>Лента пуста</p>
            <span className={style.emptyHint}>
              Подпишитесь на пользователей или добавьте друзей, чтобы видеть посты
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

import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/shared";
import { FollowerList } from "@/widget"; 
import { useGetFollowers } from "@/widget/FollowerList/hooks/useGetFollowers";

/**
 * FollowerPage — страница подписчиков
 */
const FollowerPage = (): ReactElement => {
  const { userId } = useParams<{ userId: string }>();
  const targetId = userId ? Number(userId) : undefined;
  
  const { followers, isLoading, error, refetch } = useGetFollowers(targetId);
  
  const title = targetId ? `> followers` : `> my_followers`;

  return (
    <PageLayout
      title={title}
      isLoading={isLoading}
      error={error ? `! ${error}` : null}
      onRetry={refetch}
      hideFooter={true}
    >
      <FollowerList followers={followers} />
    </PageLayout>
  );
};

export default FollowerPage;
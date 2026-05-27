import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/shared";
import { FriendList } from "@/widget";
import { useGetFriends } from "@/widget/FriendList/hooks/useGetFriends";
import style from "./FriendPage.module.css";

/**
 * FriendPage — страница друзей
 */
const FriendPage = (): ReactElement => {
  const { userId } = useParams<{ userId: string }>();
  const targetId = userId ? Number(userId) : undefined;
  
  const { friends, isLoading, error, refetch } = useGetFriends(targetId);
  
  const title = targetId ? `> friends` : `> my_friends`;

  return (
    <PageLayout
      title={title}
      isLoading={isLoading}
      error={error ? `! ${error}` : null}
      onRetry={refetch}
      contentClassName={style.contentWrapper}
      hideFooter={true}
    >
      <FriendList friends={friends} />
    </PageLayout>
  );
};

export default FriendPage;
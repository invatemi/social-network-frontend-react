import { ReactElement } from "react";
import { useParams } from "react-router-dom";
import { PageLayout } from "@/shared";
import { useUserProfile, CreatePost } from "@/feature";
import { ProfileCard, StatsCard, InfoCard } from "@/entities";
import { PostList } from "@/widget";
import { useAppSelector } from "@/app/store/hooks";
import style from "./UserPage.module.css";

/**
 * UserPage — личный профиль
 */
const UserPage = (): ReactElement => {
  const { userId } = useParams<{ userId: string }>();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const { user, loading, error, refetch, displayName, initial, isOnline } = useUserProfile(userId ? Number(userId) : 0);
  const isOwnProfile = currentUserId === user?.id;

  return (
    <PageLayout
      isLoading={loading}
      error={error ? `! ${error}` : null}
      onRetry={refetch}
      mainClassName={style.main}
      contentClassName={style.contentWrapper}
      hideFooter={true}
    >
      <CreatePost />

      <div className={style.bentoGrid}>
        <ProfileCard 
          avatarUrl={user?.avatarUrl} 
          username={displayName} 
          bio={user?.bio}
          initial={initial}
          isEditable={true}
          isOnline={isOnline}
        />

        <InfoCard 
          email={user?.email} 
          location={user?.location} 
          memberSince={user?.memberSince} 
        />

        <StatsCard 
          postsCount={user?.postsCount || 0}
          followersCount={user?.followersCount || 0}
          followingCount={user?.followingCount || 0}
          targetUserId={isOwnProfile ? undefined : user?.id}
        />
      </div>

      <PostList title={"> my_posts"} />
    </PageLayout>
  );
};

export default UserPage;
import { ReactElement } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageLayout, Button } from "@/shared";
import { useUserProfile, CreateFriend } from "@/feature";
import { ProfileCard, StatsCard, InfoCard } from "@/entities";
import { PostList } from "@/widget";
import { useAppSelector } from "@/app/store/hooks";
import style from "./PublicPage.module.css";

/**
 * PublicPage — публичный профиль
 */
const PublicPage = (): ReactElement => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  
  const { user, loading, error, displayName, initial, refetch, isOnline } = 
    useUserProfile(userId ? Number(userId) : 0, currentUserId);

  const handleBack = () => navigate(-1);
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
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={handleBack}
        className={style.backButton}
      >
        {`[<] back`}
      </Button>

      <div className={style.bentoGrid}>
        <ProfileCard 
          avatarUrl={user?.avatarUrl} 
          username={displayName} 
          bio={user?.bio}
          initial={initial}
          isEditable={false}
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

        {!isOwnProfile && user?.id && (
          <CreateFriend
            targetUserId={user.id}
            initialStatus={user.friendStatus ?? 'none'}
            isRequestReceiver={!!user.friendRequestFrom}
            currentUserId={currentUserId}
            className={style.friendCard}
          />
        )}
      </div>

      <PostList title={"> posts"} userId={user?.id} />
    </PageLayout>
  );
};

export default PublicPage;
import { ReactElement, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageLayout, Button } from "@/shared";
import { useUserProfile, CreateFriend, CreatePost, useProfileSettings, PhotoModal } from "@/feature";
import { PostList } from "@/widget";
import { useGetFriends } from "@/widget/FriendList/hooks/useGetFriends";
import { useGetChatsQuery } from "@/entities/message/api/messagesApi";
import {
  useLazyGetAvatarUploadUrlQuery,
  useUpdateUserProfileMutation,
} from "@/entities/user/api";
import {
  mapPhotoDtoToItem,
  useGetMyPhotosQuery,
  useGetUserPhotosQuery,
  type PhotoItem,
} from "@/entities/photo";
import { uploadAvatarToStorage } from "@/feature/user-detail/uploadAvatarFile";
import { useAppSelector } from "@/app/store/hooks";
import { checkPresence } from "@/app/lib/socket";
import { LocationIcon, SettingsIcon } from "./icons";
import style from "./ProfileView.module.css";

const PHOTO_PREVIEW_LIMIT = 5;

type ProfileViewProps = {
  /** Если не передан — профиль текущего пользователя */
  userId?: number;
  /** Показать форму создания поста (свой профиль) */
  showCreatePost?: boolean;
};

/**
 * ProfileView — макет профиля из Figma (баннер + фото + посты + сайдбар)
 */
const ProfileView = ({
  userId,
  showCreatePost = false,
}: ProfileViewProps): ReactElement => {
  const navigate = useNavigate();
  const { openSettings } = useProfileSettings();
  const currentUserId = useAppSelector((state) => state.auth.user?.id);
  const presence = useAppSelector((state) => state.presence.byUserId);

  const {
    user,
    loading,
    error,
    displayName,
    initial,
    refetch,
    isOnline,
    isOwnProfile,
  } = useUserProfile(userId && userId > 0 ? userId : 0, currentUserId);

  const profileUserId = user?.id;
  const { friends, isLoading: friendsLoading } = useGetFriends(
    isOwnProfile ? undefined : profileUserId
  );
  const { data: chats = [], isLoading: chatsLoading } = useGetChatsQuery(
    { limit: 8, offset: 0 },
    { skip: !currentUserId }
  );
  const [chatSearch, setChatSearch] = useState("");
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);
  const [getAvatarUploadUrl] = useLazyGetAvatarUploadUrlQuery();
  const [updateProfile] = useUpdateUserProfileMutation();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null
  );

  const myPhotosQuery = useGetMyPhotosQuery(undefined, {
    skip: !isOwnProfile || !currentUserId,
  });
  const userPhotosQuery = useGetUserPhotosQuery(profileUserId ?? 0, {
    skip: isOwnProfile || !profileUserId,
  });

  const galleryPhotos: PhotoItem[] = useMemo(() => {
    const raw = isOwnProfile ? myPhotosQuery.data : userPhotosQuery.data;
    return (raw ?? []).map(mapPhotoDtoToItem);
  }, [isOwnProfile, myPhotosQuery.data, userPhotosQuery.data]);

  const previewPhotos = galleryPhotos.slice(0, PHOTO_PREVIEW_LIMIT);

  const handleCoverChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";
      if (!file || !isOwnProfile) return;

      setCoverError(null);
      setIsCoverUploading(true);
      try {
        const coverUrl = await uploadAvatarToStorage(file, (args) =>
          getAvatarUploadUrl({
            ...args,
            fileName: `cover-${args.fileName || file.name}`,
          }).unwrap()
        );
        await updateProfile({ coverUrl }).unwrap();
        refetch();
      } catch {
        setCoverError("Не удалось загрузить обложку");
      } finally {
        setIsCoverUploading(false);
      }
    },
    [getAvatarUploadUrl, isOwnProfile, refetch, updateProfile]
  );

  const filteredChats = useMemo(() => {
    const q = chatSearch.trim().toLowerCase();
    if (!q) return chats.slice(0, 6);
    return chats
      .filter((chat) => {
        const name = chat.isGroup
          ? chat.chatName || ""
          : chat.participant?.username || "";
        return name.toLowerCase().includes(q);
      })
      .slice(0, 6);
  }, [chats, chatSearch]);

  const friendIdsKey = friends.map((f) => f.id).join(",");

  useEffect(() => {
    if (!friendIdsKey) return;
    checkPresence(friendIdsKey.split(",").map(Number));
  }, [friendIdsKey]);

  const formatChatTime = (value?: string | null) => {
    if (!value) return "";
    return new Date(value).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <PageLayout
      isLoading={loading}
      error={error ? error : null}
      onRetry={refetch}
      mainClassName={style.main}
      contentClassName={style.contentWrapper}
      hideFooter={true}
    >
      <section className={style.hero}>
        <div className={style.coverBlock}>
          {user?.coverUrl ? (
            <img
              src={user.coverUrl}
              alt=""
              className={style.coverImage}
            />
          ) : (
            <div className={style.coverPlaceholder} aria-hidden />
          )}

          {isOwnProfile && (
            <label className={style.coverUpload}>
              <input
                type="file"
                accept="image/*"
                className={style.coverInput}
                disabled={isCoverUploading}
                onChange={handleCoverChange}
              />
              {isCoverUploading ? "Загрузка..." : "Сменить обложку"}
            </label>
          )}
          {coverError && <p className={style.coverError}>{coverError}</p>}
        </div>

        <div className={style.infoBlock}>
          <div className={style.avatarWrap}>
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className={style.avatar}
              />
            ) : (
              <div className={style.avatarPlaceholder}>{initial}</div>
            )}
            <span
              className={[
                style.statusDot,
                isOwnProfile || isOnline ? style.online : style.offline,
              ]
                .filter(Boolean)
                .join(" ")}
              title={isOwnProfile || isOnline ? "Онлайн" : "Офлайн"}
            />
          </div>

          <div className={style.heroInfo}>
            <h1 className={style.displayName}>{displayName}</h1>
            <p className={style.email}>{user?.email || "Почта не указана"}</p>
            <p className={style.location}>
              <LocationIcon className={style.locationIcon} />
              {user?.location?.trim() || "Локация не указана"}
            </p>
            <p className={style.bio}>
              {user?.bio?.trim() || "Статус пока не указан"}
            </p>
          </div>

          <div className={style.heroActions}>
            {isOwnProfile ? (
              <button
                type="button"
                className={style.settingsBtn}
                onClick={openSettings}
              >
                <SettingsIcon className={style.settingsIcon} />
                Настройки профиля
              </button>
            ) : (
              user?.id && (
                <CreateFriend
                  targetUserId={user.id}
                  initialStatus={user.friendStatus ?? "none"}
                  isRequestReceiver={!!user.friendRequestFrom}
                  currentUserId={currentUserId}
                  className={style.friendAction}
                />
              )
            )}
            {!isOwnProfile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className={style.backBtn}
              >
                Назад
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className={style.layout}>
        <div className={style.mainCol}>
          {showCreatePost && isOwnProfile && (
            <div className={style.createPostWrap}>
              <CreatePost />
            </div>
          )}

          <section className={style.panel}>
            <div className={style.panelTitleRow}>
              {isOwnProfile ? (
                <Link to="/photos" className={style.panelTitleLink}>
                  <h2 className={style.panelTitle}>Фото</h2>
                </Link>
              ) : (
                <h2 className={style.panelTitle}>Фото</h2>
              )}
            </div>
            <div className={style.photosRow}>
              {previewPhotos.length === 0 ? (
                <p className={style.photosEmpty}>Нет фотографий</p>
              ) : (
                previewPhotos.map((photo) => (
                  <button
                    key={photo.id}
                    type="button"
                    className={style.photoCard}
                    onClick={() => {
                      const index = galleryPhotos.findIndex(
                        (item) => item.id === photo.id
                      );
                      if (index >= 0) setSelectedPhotoIndex(index);
                    }}
                    aria-label="Открыть фото"
                  >
                    <img
                      src={photo.url}
                      alt=""
                      className={style.photoImage}
                      loading="lazy"
                    />
                  </button>
                ))
              )}
            </div>
          </section>

          <section className={style.postsSection}>
            <PostList
              userId={isOwnProfile ? undefined : profileUserId}
              isOwnProfile={isOwnProfile}
              title=""
            />
          </section>
        </div>

        <aside className={style.sidebar}>
          <section className={style.panel}>
            <h2 className={style.panelTitle}>Сообщения</h2>
            <div className={style.searchField}>
              <span className={style.searchIcon} aria-hidden />
              <input
                type="search"
                className={style.searchInput}
                placeholder="Поиск"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                aria-label="Поиск по сообщениям"
              />
            </div>

            <div className={style.chatList}>
              {chatsLoading && <p className={style.sidebarHint}>Загрузка...</p>}
              {!chatsLoading && filteredChats.length === 0 && (
                <p className={style.sidebarHint}>Нет диалогов</p>
              )}
              {filteredChats.map((chat) => {
                const name = chat.isGroup
                  ? chat.chatName || "Группа"
                  : chat.participant?.username || "Собеседник";
                const avatar = chat.isGroup
                  ? null
                  : chat.participant?.avatarUrl || null;
                const preview = chat.lastMessage?.content || "Нет сообщений";
                const time = formatChatTime(
                  chat.lastMessage?.createdAt || chat.lastMessageAt
                );
                const unread = chat.unreadCount > 0;

                return (
                  <button
                    key={chat.chatId}
                    type="button"
                    className={style.chatItem}
                    onClick={() => navigate(`/messages/${chat.chatId}`)}
                  >
                    <div className={style.chatAvatarWrap}>
                      {avatar ? (
                        <img src={avatar} alt="" className={style.chatAvatar} />
                      ) : (
                        <div className={style.chatAvatarFallback}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {unread && <span className={style.unreadDot} />}
                    </div>
                    <div className={style.chatMeta}>
                      <div className={style.chatTop}>
                        <span className={style.chatName}>{name}</span>
                        {time && <span className={style.chatTime}>{time}</span>}
                      </div>
                      <p className={style.chatPreview}>{preview}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={style.panel}>
            <h2 className={style.panelTitle}>Друзья</h2>
            <div className={style.searchField}>
              <span className={style.searchIcon} aria-hidden />
              <input
                type="search"
                className={style.searchInput}
                placeholder="Поиск"
                disabled
                aria-label="Поиск по друзьям"
              />
            </div>

            <div className={style.friendsGrid}>
              {friendsLoading && (
                <p className={style.sidebarHint}>Загрузка...</p>
              )}
              {!friendsLoading && friends.length === 0 && (
                <p className={style.sidebarHint}>Пока нет друзей</p>
              )}
              {friends.slice(0, 8).map((friend) => {
                const online = presence[String(friend.id)] === true;
                return (
                  <Link
                    key={friend.id}
                    to={`/user/${friend.id}`}
                    className={style.friendItem}
                  >
                    <div className={style.friendAvatarWrap}>
                      {friend.avatarUrl ? (
                        <img
                          src={friend.avatarUrl}
                          alt=""
                          className={style.friendAvatar}
                        />
                      ) : (
                        <div className={style.friendAvatarFallback}>
                          {friend.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span
                        className={[
                          style.friendStatus,
                          online ? style.online : style.offline,
                        ].join(" ")}
                      />
                    </div>
                    <span className={style.friendName}>{friend.username}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        </aside>
      </div>

      {selectedPhotoIndex != null && galleryPhotos[selectedPhotoIndex] && (
        <PhotoModal
          photos={galleryPhotos}
          index={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          onIndexChange={setSelectedPhotoIndex}
          canDelete={isOwnProfile}
          ownerName={displayName}
          ownerAvatarUrl={user?.avatarUrl ?? null}
        />
      )}
    </PageLayout>
  );
};

export default ProfileView;

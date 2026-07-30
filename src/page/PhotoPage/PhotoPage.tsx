import type { ReactElement } from "react";
import { PageLayout } from "@/shared";
import { PhotosView } from "@/page/shared/PhotosView";
import { PhotoModal } from "@/feature";
import { useUserProfile } from "@/feature";
import { usePhotoPage } from "./lib/usePhotoPage";
import style from "./PhotoPage.module.css";

/**
 * PhotoPage — «Мои фотографии» (история аватаров)
 */
const PhotoPage = (): ReactElement => {
  const {
    yearGroups,
    photos,
    isLoading,
    isError,
    selectedIndex,
    openPhoto,
    closePhoto,
    setSelectedIndex,
    deletePhoto,
  } = usePhotoPage();

  const { user, displayName } = useUserProfile();

  return (
    <PageLayout mainClassName={style.mainLayout} hideFooter={true}>
      <PhotosView
        yearGroups={yearGroups}
        isLoading={isLoading}
        isError={isError}
        canDelete
        onPhotoClick={openPhoto}
        onPhotoDelete={deletePhoto}
      />
      {selectedIndex != null && photos[selectedIndex] && (
        <PhotoModal
          photos={photos}
          index={selectedIndex}
          onClose={closePhoto}
          onIndexChange={setSelectedIndex}
          canDelete
          ownerName={displayName}
          ownerAvatarUrl={user?.avatarUrl ?? null}
        />
      )}
    </PageLayout>
  );
};

export default PhotoPage;

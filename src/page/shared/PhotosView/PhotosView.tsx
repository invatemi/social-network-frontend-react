import type { ReactElement } from "react";
import { PhotoCard } from "@/entities/photo";
import type { PhotoItem, PhotoYearGroup } from "@/entities/photo";
import { Spinner } from "@/shared";
import style from "./PhotosView.module.css";

export type PhotosViewProps = {
  title?: string;
  yearGroups: PhotoYearGroup[];
  isLoading?: boolean;
  isError?: boolean;
  canDelete?: boolean;
  onPhotoClick?: (photo: PhotoItem) => void;
  onPhotoDelete?: (photo: PhotoItem) => void;
};

/**
 * PhotosView — layout-shell галереи «Мои фотографии»
 */
const PhotosView = ({
  title = "Мои фотографии",
  yearGroups,
  isLoading = false,
  isError = false,
  canDelete = false,
  onPhotoClick,
  onPhotoDelete,
}: PhotosViewProps): ReactElement => {
  const hasPhotos = yearGroups.some((group) => group.photos.length > 0);

  return (
    <div className={style.root} data-testid="photos-view">
      <header className={style.header}>
        <h1 className={style.title}>{title}</h1>
        <p className={style.hint}>
          Здесь отображаются фотографии, которые вы ставили на аватар
        </p>
      </header>

      {isLoading && (
        <div className={style.state} data-testid="photos-loading">
          <Spinner />
        </div>
      )}

      {!isLoading && isError && (
        <p className={style.stateError} data-testid="photos-error">
          Не удалось загрузить фотографии
        </p>
      )}

      {!isLoading && !isError && !hasPhotos && (
        <p className={style.empty} data-testid="photos-empty">
          Пока нет фотографий. Смените аватар в настройках профиля — снимок
          появится здесь.
        </p>
      )}

      {!isLoading && !isError && hasPhotos && (
        <div className={style.sections}>
          {yearGroups.map((group) => (
            <section
              key={group.year}
              className={style.yearSection}
              aria-labelledby={`photos-year-${group.year}`}
              data-testid={`photos-year-${group.year}`}
            >
              <h2
                id={`photos-year-${group.year}`}
                className={style.yearLabel}
              >
                {group.year}
              </h2>
              <div className={style.grid}>
                {group.photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onClick={onPhotoClick}
                    onDelete={onPhotoDelete}
                    canDelete={canDelete}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotosView;

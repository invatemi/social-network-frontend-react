import type { PhotoDto } from "../api/photoApi";
import type { PhotoItem, PhotoYearGroup } from "./type";

/**
 * Maps API photo DTO to UI PhotoItem.
 */
export const mapPhotoDtoToItem = (photo: PhotoDto): PhotoItem => ({
  id: photo.id,
  url: photo.url,
  createdAt: photo.createdAt,
  year: new Date(photo.createdAt).getFullYear(),
  userId: photo.userId,
  isCurrent: photo.isCurrent,
  likesCount: photo.likesCount,
  commentsCount: photo.commentsCount,
  isLiked: photo.isLiked,
});

/**
 * Группирует фото по году (новые годы сверху в UI — сортировка ascending по году).
 */
export const groupPhotosByYear = (photos: PhotoItem[]): PhotoYearGroup[] => {
  const map = new Map<number, PhotoItem[]>();

  for (const photo of photos) {
    const list = map.get(photo.year);
    if (list) {
      list.push(photo);
    } else {
      map.set(photo.year, [photo]);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(([year, items]) => ({
      year,
      photos: [...items].sort(
        (x, y) =>
          new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()
      ),
    }));
};

import { useMemo, useState } from "react";
import {
  groupPhotosByYear,
  mapPhotoDtoToItem,
  useDeletePhotoMutation,
  useGetMyPhotosQuery,
  type PhotoItem,
  type PhotoYearGroup,
} from "@/entities/photo";

export type UsePhotoPageReturn = {
  yearGroups: PhotoYearGroup[];
  photos: PhotoItem[];
  isLoading: boolean;
  isError: boolean;
  selectedIndex: number | null;
  openPhoto: (photo: PhotoItem) => void;
  closePhoto: () => void;
  setSelectedIndex: (index: number | null) => void;
  deletePhoto: (photo: PhotoItem) => Promise<void>;
  isDeleting: boolean;
};

/**
 * usePhotoPage — галерея истории аватаров с API
 */
export const usePhotoPage = (): UsePhotoPageReturn => {
  const { data, isLoading, isError } = useGetMyPhotosQuery();
  const [deletePhotoMutation, { isLoading: isDeleting }] =
    useDeletePhotoMutation();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const photos = useMemo(
    () => (data ?? []).map(mapPhotoDtoToItem),
    [data]
  );

  const yearGroups = useMemo(() => groupPhotosByYear(photos), [photos]);

  const openPhoto = (photo: PhotoItem) => {
    const index = photos.findIndex((item) => item.id === photo.id);
    if (index >= 0) {
      setSelectedIndex(index);
    }
  };

  const closePhoto = () => setSelectedIndex(null);

  const deletePhoto = async (photo: PhotoItem) => {
    const confirmed = window.confirm("Удалить это фото?");
    if (!confirmed) return;

    await deletePhotoMutation(photo.id).unwrap();

    if (selectedIndex == null) return;
    const nextPhotos = photos.filter((item) => item.id !== photo.id);
    if (nextPhotos.length === 0) {
      setSelectedIndex(null);
      return;
    }
    setSelectedIndex(Math.min(selectedIndex, nextPhotos.length - 1));
  };

  return {
    yearGroups,
    photos,
    isLoading,
    isError,
    selectedIndex,
    openPhoto,
    closePhoto,
    setSelectedIndex,
    deletePhoto,
    isDeleting,
  };
};

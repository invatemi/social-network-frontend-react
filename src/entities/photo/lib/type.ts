export type PhotoItem = {
  id: number;
  url: string;
  createdAt: string;
  year: number;
  userId: number;
  isCurrent?: boolean;
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
};

export type PhotoYearGroup = {
  year: number;
  photos: PhotoItem[];
};

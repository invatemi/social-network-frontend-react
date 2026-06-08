export type InfoCardProps = {
  email?: string;
  location?: string;
  memberSince?: string;
};

export type ProfileCardProps = {
  avatarUrl: string | null | undefined;
  username: string;
  bio?: string;
  initial: string;
  isEditable: boolean;
  isOnline?: boolean;
};

export type StatsCardProps = {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  targetUserId?: number;
};

/**
 * Профиль пользователя в приложении.
 * 
 * @description
 * Используется для отображения данных пользователя в профилях, карточках,
 * настройках и других компонентах. Содержит как обязательные поля (ид, имя, email),
 * так и опциональные метаданные (био, локация, статистика, статус дружбы).
 */
export type UserProfile = {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string;
  location?: string;
  memberSince?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
  friendStatus?: 'none' | 'pending' | 'friends' | 'blocked';
  friendRequestFrom?: number;
  isOnline?: boolean;
};
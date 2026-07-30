/**
 * Профиль пользователя в приложении.
 */
export type UserProfile = {
  id: number;
  username: string;
  email: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
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

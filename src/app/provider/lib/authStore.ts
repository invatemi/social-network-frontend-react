type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type UserProfile = {
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
};

const STORAGE_KEY = 'auth_tokens';
const USER_KEY = 'user';

/**
 * Safely parses JSON from localStorage with error handling.
 * @param value - Raw string from localStorage
 * @returns Parsed object or null if parsing fails
 */
const parseJsonSafe = <T>(value: string | null): T | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    console.error('[AuthStore] Failed to parse localStorage data:', error);
    return null;
  }
};

/**
 * Authentication storage utility for localStorage.
 * Handles tokens and user profile persistence.
 */
export const authStore = {
  /**
   * Saves auth tokens to localStorage.
   * @param tokens - Access and refresh tokens
   */
  save: (tokens: AuthTokens): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  },

  /**
   * Retrieves auth tokens from localStorage.
   * @returns Tokens object or null if not found/invalid
   */
  get: (): AuthTokens | null => {
    return parseJsonSafe<AuthTokens>(localStorage.getItem(STORAGE_KEY));
  },

  /**
   * Saves or removes user profile data.
   * @param user - Profile data or null to clear
   */
  saveUser: (user: UserProfile | null): void => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  },

  /**
   * Retrieves user profile from localStorage.
   * @returns User profile or null if not found/invalid
   */
  getUser: (): UserProfile | null => {
    return parseJsonSafe<UserProfile>(localStorage.getItem(USER_KEY));
  },

  /**
   * Clears all authentication data (tokens + user).
   * Use on logout.
   */
  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Quick access to access token.
   * @returns Access token string or undefined
   */
  getAccessToken: (): string | undefined => {
    return authStore.get()?.accessToken;
  },

  /**
   * Quick access to refresh token.
   * @returns Refresh token string or undefined
   */
  getRefreshToken: (): string | undefined => {
    return authStore.get()?.refreshToken;
  },
};
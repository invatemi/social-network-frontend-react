import { baseApi } from "@/app/store/api/baseApi";

export type FriendStatus = 'none' | 'pending' | 'friends';

export type FriendEntity = {
  id: number;
  username: string;
  avatarUrl: string | null;
  friendsSince: string;
};

export type FriendsResponse = {
  friends: FriendEntity[];
  total: number;
  pagination?: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
};

export type FriendStatusResponse = {
  status: FriendStatus;
  friendRequestFrom: number | null;
  isFollowing: boolean;
};

export type FriendActionResponse = {
  success: boolean;
  message: string;
  newStatus: FriendStatus;
  friendRequestFrom: number | null;
  isFollowing: boolean;
};

/**
 * Friend management API endpoints.
 */
export const friendApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Fetches the current user's friends list.
     * @returns Paginated list of friends
     */
    getMyFriends: builder.query<FriendsResponse, void>({
      query: () => '/api/users/me/friends',
      providesTags: ['Friends'],
    }),
    
    /**
     * Fetches friends list for a specific user.
     * @param userId - Target user ID
     * @returns Paginated list of user's friends
     */
    getUserFriends: builder.query<FriendsResponse, { userId: number }>({
      query: ({ userId }) => `/api/users/${userId}/friends`,
      providesTags: (_result, _error, { userId }) => [
        { type: 'Friends' as const, id: userId },
        'Friends',
      ],
    }),

    /**
     * Fetches friendship status with a specific user.
     * @param userId - Target user ID
     * @returns Friendship status and request metadata
     */
    getFriendStatus: builder.query<FriendStatusResponse, { userId: number }>({
      query: ({ userId }) => `/api/users/${userId}/friend-status`,
      providesTags: (_result, _error, { userId }) => [
        { type: 'FriendStatus' as const, id: userId },
        'FriendStatus',
      ],
    }),

    /**
     * Performs a friendship action: add, cancel, accept, decline, remove, or unfollow.
     * @param targetUserId - ID of the user to interact with
     * @param action - Action type: 'add' | 'cancel' | 'accept' | 'decline' | 'remove' | 'unfollow'
     * @returns Operation result with updated friendship status
     */
    friendAction: builder.mutation<FriendActionResponse, { 
      targetUserId: number; 
      action: 'add' | 'cancel' | 'accept' | 'decline' | 'remove' | 'unfollow'
    }>({
      query: ({ targetUserId, action }) => ({
        url: `/api/users/${targetUserId}/friend`,
        method: 'POST',
        body: { action },
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [
        'FriendStatus',
        'Friends',
        { type: 'User' as const, id: targetUserId },
        'User',
        'UserMe',
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMyFriendsQuery,
  useGetUserFriendsQuery,
  useGetFriendStatusQuery,
  useFriendActionMutation,
} = friendApi;
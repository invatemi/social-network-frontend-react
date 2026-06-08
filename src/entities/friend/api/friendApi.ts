import { baseApi } from "@/app/store/api/baseApi";

export type FriendStatus = 'none' | 'pending' | 'friends' | 'blocked';

type UserSummaryDto = {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
};

type FriendDto = UserSummaryDto & {
  friendsSince: string;
};

type FriendsDtoResponse = {
  success?: boolean;
  friends: FriendDto[];
  total: number;
  nextCursor?: string | null;
};

type FriendRequestDto = {
  id: number;
  fromUser: UserSummaryDto;
  toUser: UserSummaryDto;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type FriendRequestsDtoResponse = {
  success?: boolean;
  requests: FriendRequestDto[];
  total: number;
  nextCursor?: string | null;
};

export type UserListPaginationParams = {
  limit?: number;
  cursor?: string | null;
};

export type FriendEntity = {
  id: number;
  username: string;
  avatarUrl: string | null;
  friendsSince: string;
};

export type FriendsResponse = {
  friends: FriendEntity[];
  total: number;
  nextCursor?: string | null;
  hasMore: boolean;
};

export type FriendStatusResponse = {
  status: FriendStatus;
  friendRequestFrom: number | null;
  isFollowing: boolean;
  isFollowedBy: boolean;
  incomingRequestId: number | null;
  outgoingRequestId: number | null;
};

export type FriendActionResponse = {
  success: boolean;
  message: string;
  newStatus: FriendStatus;
  friendRequestFrom: number | null;
  isFollowing: boolean;
};

export type FriendRequestEntity = {
  id: number;
  fromUser: FriendEntity;
  toUser: FriendEntity;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type FriendRequestsResponse = {
  requests: FriendRequestEntity[];
  total: number;
  nextCursor?: string | null;
  hasMore: boolean;
};

export type UserRelationResponse = {
  isFriend: boolean;
  isFollowing: boolean;
  isFollowedBy: boolean;
  hasIncomingRequest: boolean;
  hasOutgoingRequest: boolean;
};

export type FriendsCountResponse = {
  friendsCount: number;
};

const withPaginationParams = ({ limit, cursor }: UserListPaginationParams = {}) => ({
  ...(limit ? { limit } : {}),
  ...(cursor ? { cursor } : {}),
});

const mapFriend = (friend: FriendDto | UserSummaryDto, friendsSince?: string): FriendEntity => ({
  id: friend.id,
  username: friend.name,
  avatarUrl: friend.avatarUrl,
  friendsSince: friendsSince ?? ("friendsSince" in friend ? friend.friendsSince : new Date().toISOString()),
});

const mapFriendsResponse = (response: FriendsDtoResponse): FriendsResponse => ({
  friends: response.friends.map((friend) => mapFriend(friend)),
  total: response.total,
  nextCursor: response.nextCursor ?? null,
  hasMore: Boolean(response.nextCursor),
});

const mapFriendRequest = (request: FriendRequestDto): FriendRequestEntity => ({
  id: request.id,
  fromUser: mapFriend(request.fromUser, request.createdAt),
  toUser: mapFriend(request.toUser, request.createdAt),
  status: request.status,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
});

const mapFriendRequestsResponse = (
  response: FriendRequestsDtoResponse
): FriendRequestsResponse => ({
  requests: response.requests.map(mapFriendRequest),
  total: response.total,
  nextCursor: response.nextCursor ?? null,
  hasMore: Boolean(response.nextCursor),
});

const buildFriendStatus = (
  relation?: UserRelationResponse,
  incomingRequestId: number | null = null,
  outgoingRequestId: number | null = null
): FriendStatusResponse => {
  const hasIncomingRequest = Boolean(relation?.hasIncomingRequest || incomingRequestId);
  const hasOutgoingRequest = Boolean(relation?.hasOutgoingRequest || outgoingRequestId);

  return {
    status: relation?.isFriend ? "friends" : hasIncomingRequest || hasOutgoingRequest ? "pending" : "none",
    friendRequestFrom: hasIncomingRequest ? incomingRequestId : null,
    isFollowing: relation?.isFollowing ?? false,
    isFollowedBy: relation?.isFollowedBy ?? false,
    incomingRequestId,
    outgoingRequestId,
  };
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
    getMyFriends: builder.query<FriendsResponse, UserListPaginationParams | void>({
      query: (params) => ({
        url: '/api/users/me/friends',
        params: withPaginationParams(params || undefined),
      }),
      transformResponse: mapFriendsResponse,
      providesTags: ['Friends'],
    }),
    
    /**
     * Fetches friends list for a specific user.
     * @param userId - Target user ID
     * @returns Paginated list of user's friends
     */
    getUserFriends: builder.query<
      FriendsResponse,
      { userId: number } & UserListPaginationParams
    >({
      query: ({ userId, ...params }) => ({
        url: `/api/users/${userId}/friends`,
        params: withPaginationParams(params),
      }),
      transformResponse: mapFriendsResponse,
      providesTags: (_result, _error, { userId }) => [
        { type: 'Friends' as const, id: userId },
        'Friends',
      ],
    }),

    getUserFriendsCount: builder.query<FriendsCountResponse, { userId: number }>({
      query: ({ userId }) => `/api/users/${userId}/friends/count`,
      transformResponse: (response: FriendsCountResponse & { success?: boolean }) => ({
        friendsCount: response.friendsCount,
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: 'Friends' as const, id: userId },
        { type: 'User' as const, id: userId },
      ],
    }),

    /**
     * Fetches relation status with a specific user.
     * @param userId - Target user ID
     * @returns Friendship status and request metadata
     */
    getFriendStatus: builder.query<FriendStatusResponse, { userId: number }>({
      async queryFn({ userId }, _queryApi, _extraOptions, fetchWithBQ) {
        const [relationResult, incomingResult, outgoingResult] = await Promise.all([
          fetchWithBQ(`/api/users/${userId}/relation`),
          fetchWithBQ('/api/users/me/friends/requests/incoming'),
          fetchWithBQ('/api/users/me/friends/requests/outgoing'),
        ]);

        if (relationResult.error) {
          return { error: relationResult.error };
        }

        const relation = relationResult.data as UserRelationResponse;
        const incoming = incomingResult.data
          ? mapFriendRequestsResponse(
              incomingResult.data as FriendRequestsDtoResponse
            ).requests.find((request) => request.fromUser.id === userId)
          : undefined;
        const outgoing = outgoingResult.data
          ? mapFriendRequestsResponse(
              outgoingResult.data as FriendRequestsDtoResponse
            ).requests.find((request) => request.toUser.id === userId)
          : undefined;

        return {
          data: buildFriendStatus(
            relation,
            incoming?.id ?? null,
            outgoing?.id ?? null
          ),
        };
      },
      providesTags: (_result, _error, { userId }) => [
        { type: 'FriendStatus' as const, id: userId },
        'FriendStatus',
      ],
    }),

    /**
     * Fetches incoming friend requests for the current user.
     */
    getIncomingFriendRequests: builder.query<FriendRequestsResponse, UserListPaginationParams | void>({
      query: (params) => ({
        url: '/api/users/me/friends/requests/incoming',
        params: withPaginationParams(params || undefined),
      }),
      transformResponse: mapFriendRequestsResponse,
      providesTags: ['FriendStatus', 'Friends'],
    }),

    /**
     * Fetches outgoing friend requests for the current user.
     */
    getOutgoingFriendRequests: builder.query<FriendRequestsResponse, UserListPaginationParams | void>({
      query: (params) => ({
        url: '/api/users/me/friends/requests/outgoing',
        params: withPaginationParams(params || undefined),
      }),
      transformResponse: mapFriendRequestsResponse,
      providesTags: ['FriendStatus', 'Friends'],
    }),

    /**
     * Sends a friend request. Backend also moves the target user to following.
     */
    sendFriendRequest: builder.mutation<FriendActionResponse, { targetUserId: number }>({
      query: ({ targetUserId }) => ({
        url: `/api/users/${targetUserId}/friends/request`,
        method: 'POST',
      }),
      transformResponse: (response: { success: boolean; message?: string }) => ({
        success: response.success,
        message: response.message ?? 'Friend request sent',
        newStatus: 'pending' as const,
        friendRequestFrom: null,
        isFollowing: true,
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [
        'FriendStatus',
        'Friends',
        { type: 'FriendStatus' as const, id: targetUserId },
        { type: 'User' as const, id: targetUserId },
        'User',
        'UserMe',
      ],
    }),

    /**
     * Accepts an incoming friend request by request id.
     */
    acceptFriendRequest: builder.mutation<FriendActionResponse, { 
      requestId: number;
      targetUserId: number;
    }>({
      query: ({ requestId }) => ({
        url: `/api/users/me/friends/requests/${requestId}/accept`,
        method: 'POST',
      }),
      transformResponse: (response: { success: boolean; message?: string }) => ({
        success: response.success,
        message: response.message ?? 'Friend request accepted',
        newStatus: 'friends' as const,
        friendRequestFrom: null,
        isFollowing: false,
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [
        'FriendStatus',
        'Friends',
        { type: 'FriendStatus' as const, id: targetUserId },
        { type: 'User' as const, id: targetUserId },
        'User',
        'UserMe',
      ],
    }),

    /**
     * Removes a friend. Backend moves removed user to following.
     */
    removeFriend: builder.mutation<FriendActionResponse, { targetUserId: number }>({
      query: ({ targetUserId }) => ({
        url: `/api/users/me/friends/${targetUserId}`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean; message?: string }) => ({
        success: response.success,
        message: response.message ?? 'Friend removed',
        newStatus: 'none' as const,
        friendRequestFrom: null,
        isFollowing: true,
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [
        'FriendStatus',
        'Friends',
        { type: 'FriendStatus' as const, id: targetUserId },
        { type: 'User' as const, id: targetUserId },
        'User',
        'UserMe',
      ],
    }),

    followUser: builder.mutation<FriendActionResponse, { targetUserId: number }>({
      query: ({ targetUserId }) => ({
        url: `/api/users/${targetUserId}/follow`,
        method: 'POST',
      }),
      transformResponse: (response: { success: boolean; message?: string }) => ({
        success: response.success,
        message: response.message ?? 'Successfully followed user',
        newStatus: 'none' as const,
        friendRequestFrom: null,
        isFollowing: true,
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [
        'FriendStatus',
        { type: 'FriendStatus' as const, id: targetUserId },
        { type: 'User' as const, id: targetUserId },
        'User',
        'UserMe',
      ],
    }),

    unfollowUser: builder.mutation<FriendActionResponse, { targetUserId: number }>({
      query: ({ targetUserId }) => ({
        url: `/api/users/${targetUserId}/follow`,
        method: 'DELETE',
      }),
      transformResponse: (response: { success: boolean; message?: string }) => ({
        success: response.success,
        message: response.message ?? 'Successfully unfollowed user',
        newStatus: 'none' as const,
        friendRequestFrom: null,
        isFollowing: false,
      }),
      invalidatesTags: (_result, _error, { targetUserId }) => [
        'FriendStatus',
        { type: 'FriendStatus' as const, id: targetUserId },
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
  useGetUserFriendsCountQuery,
  useGetFriendStatusQuery,
  useGetIncomingFriendRequestsQuery,
  useGetOutgoingFriendRequestsQuery,
  useSendFriendRequestMutation,
  useAcceptFriendRequestMutation,
  useRemoveFriendMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
} = friendApi;
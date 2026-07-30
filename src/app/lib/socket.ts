import { io, Socket } from 'socket.io-client';
import { postApi } from '@/entities/post/api/postApi';
import { userApi } from '@/entities/user/api/userApi';
import { commentApi } from '@/entities/comment/api/commentApi';
import { notificationsApi } from '../store/api/notificationsApi';
import { friendApi } from '@/entities/friend/api/friendApi';
import { followersApi } from '@/entities/follower/api/followerApi';
import { photoApi } from '@/entities/photo/api/photoApi';
import { FeedPost } from '@/entities/post/api/postApi';
import { messagesApi } from '@/entities/message/api/messagesApi';
import { env } from '@/shared/config/env';
import type { AppDispatch } from '@/app/store/types';
import { store } from '@/app/store';
import { patchPostInCaches, removePostFromCaches } from '@/app/lib/postRealtimeCache';
import { registerSocketDisconnectHandler } from '@/app/lib/socketDisconnect';
import {
  setUserOnline,
  setUserOffline,
  setPresenceStatuses,
} from '@/app/store/slices/presenceSlice';

let socket: Socket | null = null;
let isInitialized = false;

export type SocketConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

type StatusListener = (status: SocketConnectionStatus) => void;

let connectionStatus: SocketConnectionStatus = 'disconnected';
const statusListeners = new Set<StatusListener>();

const setConnectionStatus = (nextStatus: SocketConnectionStatus): void => {
  connectionStatus = nextStatus;
  statusListeners.forEach((listener) => listener(nextStatus));
};

const registerConnectionStatusHandlers = (activeSocket: Socket, dispatch: AppDispatch): void => {
  activeSocket.on('connect', () => {
    setConnectionStatus('connected');
    console.log('[Socket] Connected');
    const currentUserId = store.getState().auth.user?.id;
    if (currentUserId) {
      dispatch(setUserOnline(currentUserId));
    }
  });

  activeSocket.on('disconnect', (reason: string) => {
    setConnectionStatus('disconnected');
    console.log(`[Socket] Disconnected: ${reason}`);
  });

  activeSocket.io.on('reconnect_attempt', () => {
    setConnectionStatus('reconnecting');
  });
};

// ==================== TYPES ====================

export type SocketMessage = {
  id: number;
  content: string;
  createdAt: string;
  chatId: number;
  author: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
};

export type SocketChatCreated = {
  chatId: number;
  chatName: string | null;
  isGroup: boolean;
  createdAt: string;
  participantIds: number[];
};

export type SocketChatEvent = {
  chatId: number;
  action: 'deleted' | 'left';
};

export type SocketUserLeft = {
  chatId: number;
  userId: number;
};

// ==================== PRIVATE FUNCTIONS ====================

const registerSocketHandlers = (activeSocket: Socket, dispatch: AppDispatch): void => {
  console.log('[Socket] Registering event handlers');

  activeSocket.on('post:created', () => {
    dispatch(postApi.util.invalidateTags(['Feed', 'Posts']));
  });

  activeSocket.on('post:updated', (data: FeedPost & { postId?: number }) => {
    const postId = data.id ?? data.postId;
    if (!postId) return;

    patchPostInCaches(dispatch, store.getState(), postId, {
      content: data.content,
      imageUrl: data.imageUrl,
      images: data.imageUrl ? [data.imageUrl] : data.images,
      likesCount: data.likesCount,
      commentsCount: data.commentsCount,
    });
    dispatch(postApi.util.invalidateTags([{ type: 'Posts', id: postId }]));
  });

  activeSocket.on('post:deleted', (data: { postId: number }) => {
    removePostFromCaches(dispatch, store.getState(), data.postId);
    dispatch(postApi.util.invalidateTags(['Feed', 'Posts', { type: 'Posts', id: data.postId }]));
  });

  activeSocket.on('post:liked', (data: { postId: number; likesCount: number; liked: boolean; userId: number }) => {
    const currentUserId = store.getState().auth.user?.id;
    patchPostInCaches(dispatch, store.getState(), data.postId, {
      likesCount: data.likesCount,
      ...(currentUserId === data.userId ? { isLiked: data.liked } : {}),
    });
  });

  activeSocket.on('comment:created', (data: {
    id: number;
    content: string;
    createdAt: string;
    postId: number;
    commentsCount?: number;
    author: { id: number; username: string; avatarUrl: string | null };
  }) => {
    if (data.commentsCount !== undefined) {
      patchPostInCaches(dispatch, store.getState(), data.postId, {
        commentsCount: data.commentsCount,
      });
    } else {
      dispatch(postApi.util.invalidateTags([{ type: 'Posts', id: data.postId }]));
    }
    dispatch(commentApi.util.invalidateTags([{ type: 'Comments', id: `LIST_${data.postId}` }]));
  });

  activeSocket.on('comment:deleted', (data: {
    commentId: number;
    postId: number;
    deletedBy: number;
    commentsCount?: number;
  }) => {
    if (data.commentsCount !== undefined) {
      patchPostInCaches(dispatch, store.getState(), data.postId, {
        commentsCount: data.commentsCount,
      });
    } else {
      dispatch(postApi.util.invalidateTags([{ type: 'Posts', id: data.postId }]));
    }
    dispatch(
      commentApi.util.updateQueryData('getComments', { postId: data.postId }, (draft) => {
        draft.comments = draft.comments.filter((c) => c.id !== data.commentId);
      })
    );
  });

  activeSocket.on('notification:friend_request', (data: {
    id: number;
    type: 'friend_request';
    fromUser: { id: number; username: string; avatarUrl: string | null };
    toUser: { id: number };
    createdAt: string;
    status: 'pending';
  }) => {
    dispatch(notificationsApi.util.invalidateTags(['Friends']));
    dispatch(friendApi.util.invalidateTags([
      { type: 'FriendStatus', id: data.fromUser.id },
      { type: 'FriendStatus', id: data.toUser.id },
      'FriendStatus',
      'Friends',
    ]));
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: data.toUser.id }, 'User', 'UserMe']));
  });

  activeSocket.on('notification:friend_accepted', (data: {
    id: number;
    type: 'friend_accepted';
    fromUser: { id: number; username: string; avatarUrl: string | null };
    toUser: { id: number };
    createdAt: string;
    status: 'accepted';
  }) => {
    dispatch(friendApi.util.invalidateTags([
      { type: 'FriendStatus', id: data.fromUser.id },
      { type: 'FriendStatus', id: data.toUser.id },
      'FriendStatus',
      'Friends',
      'User',
    ]));
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: data.fromUser.id }, 'User', 'UserMe']));
    if (data.toUser.id !== data.fromUser.id) {
      dispatch(userApi.util.invalidateTags([{ type: 'User', id: data.toUser.id }]));
    }
  });

  activeSocket.on('notification:friend_updated', (data: {
    id: number;
    type: 'friend_request_cancelled' | 'friend_declined' | 'friend_removed';
    fromUser: { id: number };
    toUser: { id: number };
    createdAt: string;
  }) => {
    dispatch(friendApi.util.invalidateTags([
      { type: 'FriendStatus', id: data.fromUser.id },
      { type: 'FriendStatus', id: data.toUser.id },
      'FriendStatus',
      'Friends',
    ]));
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: data.fromUser.id }, 'User', 'UserMe', { type: 'User', id: data.toUser.id }]));
  });

  activeSocket.on('notification:follow_updated', (data: {
    fromUser: { id: number };
    toUser: { id: number };
  }) => {
    dispatch(followersApi.util.invalidateTags(['User']));
    dispatch(userApi.util.invalidateTags([
      { type: 'User', id: data.fromUser.id },
      { type: 'User', id: data.toUser.id },
      'UserMe',
    ]));
  });

  activeSocket.on('user:profile_updated', ({ userId }: { userId: number }) => {
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: userId }, 'User', 'UserMe']));
    dispatch(photoApi.util.invalidateTags([
      { type: 'Photos', id: `USER_${userId}` },
      { type: 'Photos', id: 'LIST' },
      { type: 'Photos', id: 'ME' },
    ]));
  });

  activeSocket.on('photo:created', (data: {
    photoId: number;
    userId: number;
    url: string;
    isCurrent: boolean;
    createdAt: string;
  }) => {
    dispatch(photoApi.util.invalidateTags([
      { type: 'Photos', id: data.photoId },
      { type: 'Photos', id: `USER_${data.userId}` },
      { type: 'Photos', id: 'LIST' },
      { type: 'Photos', id: 'ME' },
    ]));
    if (data.isCurrent) {
      dispatch(userApi.util.invalidateTags([{ type: 'User', id: data.userId }, 'User', 'UserMe']));
    }
  });

  activeSocket.on('photo:deleted', (data: { photoId: number; userId: number }) => {
    dispatch(photoApi.util.invalidateTags([
      { type: 'Photos', id: data.photoId },
      { type: 'Photos', id: `USER_${data.userId}` },
      { type: 'Photos', id: 'LIST' },
      { type: 'Photos', id: 'ME' },
    ]));
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: data.userId }, 'User', 'UserMe']));
  });

  activeSocket.on('user:online', ({ userId }: { userId: number }) => {
    dispatch(setUserOnline(userId));
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: userId }, 'User', 'UserMe']));
  });

  activeSocket.on('user:offline', ({ userId }: { userId: number }) => {
    dispatch(setUserOffline(userId));
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: userId }, 'User', 'UserMe']));
  });

  activeSocket.on('presence:status', (data: { statuses?: Record<string, boolean> }) => {
    if (data?.statuses) {
      dispatch(setPresenceStatuses(data.statuses));
    }
  });

  activeSocket.on('message:new', (message: SocketMessage) => {
    dispatch(messagesApi.util.invalidateTags([
      { type: 'Messages', id: `CHAT_${message.chatId}` },
      { type: 'Chats', id: 'LIST' }
    ]));
  });

  activeSocket.on('chat:deleted', (data: SocketChatEvent) => {
    dispatch(messagesApi.util.invalidateTags([
      { type: 'Chat', id: data.chatId },
      { type: 'Chats', id: 'LIST' },
      { type: 'Messages', id: `CHAT_${data.chatId}` }
    ]));
  });

  activeSocket.on('user:left', (data: SocketUserLeft) => {
    dispatch(messagesApi.util.invalidateTags([
      { type: 'Chat', id: data.chatId },
      { type: 'Chats', id: 'LIST' }
    ]));
  });

  activeSocket.on('chat:created', () => {
    dispatch(messagesApi.util.invalidateTags([{ type: 'Chats', id: 'LIST' }]));
  });
};

// ==================== PUBLIC FUNCTIONS ====================

/**
 * Initializes or reconnects the WebSocket connection.
 */
export const initSocket = (token: string, dispatch: AppDispatch): Socket | null => {
  if (socket?.connected) {
    socket.auth = { token };
    return socket;
  }

  if (socket) {
    socket.auth = { token };
    setConnectionStatus('reconnecting');
    socket.connect();
    return socket;
  }

  if (import.meta.env.DEV) {
    console.log('[Socket] Establishing new connection');
  }
  setConnectionStatus('reconnecting');

  socket = io(env.wsUrl, {
    auth: { token },
    transports: env.socket.transports,
    reconnection: env.socket.reconnection,
    reconnectionAttempts: env.socket.reconnectionAttempts,
    reconnectionDelay: env.socket.reconnectionDelayMs,
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!isInitialized) {
    registerSocketHandlers(socket, dispatch);
    registerConnectionStatusHandlers(socket, dispatch);
    isInitialized = true;
  }

  socket.on('connect_error', (err: Error) => {
    console.error('[Socket] Connection error:', err.message);
    setConnectionStatus('disconnected');
  });

  return socket;
};

/** Emits a join event for the specified chat room. */
export const joinChatRoom = (chatId: number): void => {
  socket?.emit('chat:join', chatId);
};

/** Emits a leave event for the specified chat room. */
export const leaveChatRoom = (chatId: number): void => {
  socket?.emit('chat:leave', chatId);
};

/** Requests current online status for the given user IDs. */
export const checkPresence = (userIds: number[]): void => {
  const uniqueIds = [...new Set(userIds.filter((id) => Number.isInteger(id) && id > 0))];
  if (uniqueIds.length === 0 || !socket?.connected) return;
  socket.emit('presence:check', { userIds: uniqueIds });
};

/** Disconnects and cleans up the socket instance. */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('[Socket] Disconnecting');
    socket.disconnect();
    socket = null;
    isInitialized = false;
  }

  setConnectionStatus('disconnected');
};

registerSocketDisconnectHandler(disconnectSocket);

/** Returns the current socket instance. */
export const getSocket = (): Socket | null => socket;

/** Returns the current WebSocket connection status. */
export const getSocketStatus = (): SocketConnectionStatus => connectionStatus;

/** Subscribes to WebSocket connection status changes. */
export const subscribeSocketStatus = (
  listener: (nextStatus: SocketConnectionStatus) => void
): (() => void) => {
  statusListeners.add(listener);
  listener(connectionStatus);

  return () => {
    statusListeners.delete(listener);
  };
};

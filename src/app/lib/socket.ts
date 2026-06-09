import { io, Socket } from 'socket.io-client';
import { postApi } from '@/entities/post/api/postApi';
import { userApi } from '@/entities/user/api/userApi';
import { commentApi } from '@/entities/comment/api/commentApi';
import { notificationsApi } from '../store/api/notificationsApi';
import { friendApi } from '@/entities/friend/api/friendApi';
import { followersApi } from '@/entities/follower/api/followerApi';
import { FeedPost } from '@/entities/post/api/postApi';
import { messagesApi } from '@/entities/message/api/messagesApi';
import { env } from '@/shared/config/env';
import type { AppDispatch } from '@/app/store/types';

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

const registerConnectionStatusHandlers = (activeSocket: Socket): void => {
  activeSocket.on('connect', () => {
    setConnectionStatus('connected');
    console.log('[Socket] Connected');
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

const invalidatePostTags = (dispatch: AppDispatch): void => {
  dispatch(postApi.util.invalidateTags(['Posts', 'Feed', { type: 'Posts', id: 'LIST' }]));
};

/**
 * Registers all socket event handlers with the store dispatcher.
 * Called only once per session to avoid duplicate handlers.
 */
const registerSocketHandlers = (activeSocket: Socket, dispatch: AppDispatch): void => {
  console.log('[Socket] Registering event handlers');

  activeSocket.on('post:created', (_newPost: FeedPost) => {
    invalidatePostTags(dispatch);
  });

  activeSocket.on('post:updated', (_data: FeedPost) => {
    invalidatePostTags(dispatch);
  });

  activeSocket.on('post:deleted', (_data: { postId: number }) => {
    invalidatePostTags(dispatch);
  });

  activeSocket.on('post:liked', (_data: { postId: number; likesCount: number; liked: boolean; userId: number }) => {
    dispatch(postApi.util.invalidateTags(['Posts']));
  });

  activeSocket.on('comment:created', (data: {
    id: number;
    content: string;
    createdAt: string;
    postId: number;
    author: { id: number; username: string; avatarUrl: string | null };
  }) => {
    dispatch(commentApi.util.invalidateTags([{ type: "Comments", id: `LIST_${data.postId}` }]));
    dispatch(postApi.util.invalidateTags(['Posts']));
  });

  activeSocket.on('comment:deleted', (data: { commentId: number; postId: number; deletedBy: number }) => {
    dispatch(commentApi.util.invalidateTags([{ type: "Comments", id: `LIST_${data.postId}` }]));
    dispatch(postApi.util.invalidateTags(['Posts']));
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
    dispatch(friendApi.util.invalidateTags([{ type: 'FriendStatus', id: data.fromUser.id }]));
    dispatch(friendApi.util.invalidateTags(['Friends']));
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
    dispatch(friendApi.util.invalidateTags([{ type: 'FriendStatus', id: data.fromUser.id }, 'Friends', 'User']));
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
    dispatch(friendApi.util.invalidateTags([{ type: 'FriendStatus', id: data.fromUser.id }, 'Friends']));
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
  });

  activeSocket.on('user:online', ({ userId }: { userId: number }) => {
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: userId }, 'User', 'UserMe']));
  });

  activeSocket.on('user:offline', ({ userId }: { userId: number }) => {
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: userId }, 'User', 'UserMe']));
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

  activeSocket.on('chat:created', (_data: { chatId: number; participantIds: number[] }) => {
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

  console.log(`[Socket] Establishing new connection: ${env.wsUrl}`);
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
    registerConnectionStatusHandlers(socket);
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

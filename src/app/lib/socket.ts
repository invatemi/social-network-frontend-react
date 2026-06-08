import { io, Socket } from 'socket.io-client';
import { postApi } from '@/entities/post/api/postApi';
import { userApi } from '@/entities/user/api/userApi';
import { commentApi } from '@/entities/comment/api/commentApi';
import { notificationsApi } from '../store/api/notificationsApi';
import { friendApi } from '@/entities/friend/api/friendApi';
import { FeedPost } from '@/entities/post/api/postApi';
import { messagesApi } from '@/entities/message/api/messagesApi';
import type { AppDispatch } from '@/app/store/types';

let socket: Socket | null = null;
let isInitialized = false;

const SOCKET_URL =
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3004';

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

/**
 * Registers all socket event handlers with the store dispatcher.
 * Called only once per session to avoid duplicate handlers.
 * @param socket - The active Socket instance
 * @param dispatch - Redux dispatch function
 */
const registerSocketHandlers = (socket: Socket, dispatch: AppDispatch): void => {
  console.log('[Socket] Registering event handlers');

  socket.on('post:created', (_newPost: FeedPost) => {
    dispatch(postApi.util.invalidateTags(['Posts', 'Feed', { type: 'Posts', id: 'LIST' }]));
  });

  socket.on('post:liked', (_data: { postId: number; likesCount: number; liked: boolean; userId: number }) => {
    dispatch(postApi.util.invalidateTags(['Posts']));
  });

  socket.on('comment:created', (data: {
    id: number;
    content: string;
    createdAt: string;
    postId: number;
    author: { id: number; username: string; avatarUrl: string | null };
  }) => {
    dispatch(commentApi.util.invalidateTags([{ type: "Comments", id: `LIST_${data.postId}` }]));
    dispatch(postApi.util.invalidateTags(['Posts']));
  });

  socket.on('comment:deleted', (data: { commentId: number; postId: number; deletedBy: number }) => {
    dispatch(commentApi.util.invalidateTags([{ type: "Comments", id: `LIST_${data.postId}` }]));
    dispatch(postApi.util.invalidateTags(['Posts']));
  });

  socket.on('notification:friend_request', (data: {
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

  socket.on('notification:friend_accepted', (data: {
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

  socket.on('notification:friend_updated', (data: {
    id: number;
    type: 'friend_request_cancelled' | 'friend_declined' | 'friend_removed';
    fromUser: { id: number };
    toUser: { id: number };
    createdAt: string;
  }) => {
    dispatch(friendApi.util.invalidateTags([{ type: 'FriendStatus', id: data.fromUser.id }, 'Friends']));
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: data.fromUser.id }, 'User', 'UserMe', { type: 'User', id: data.toUser.id }]));
  });

  socket.on('user:online', ({ userId }: { userId: number }) => {
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: userId }, 'User', 'UserMe']));
  });

  socket.on('user:offline', ({ userId }: { userId: number }) => {
    dispatch(userApi.util.invalidateTags([{ type: 'User', id: userId }, 'User', 'UserMe']));
  });

  socket.on('message:new', (message: SocketMessage) => {
    dispatch(messagesApi.util.invalidateTags([
      { type: 'Messages', id: `CHAT_${message.chatId}` },
      { type: 'Chats', id: 'LIST' }
    ]));
  });

  socket.on('chat:deleted', (data: SocketChatEvent) => {
    dispatch(messagesApi.util.invalidateTags([
      { type: 'Chat', id: data.chatId },
      { type: 'Chats', id: 'LIST' },
      { type: 'Messages', id: `CHAT_${data.chatId}` }
    ]));
  });

  socket.on('user:left', (data: SocketUserLeft) => {
    dispatch(messagesApi.util.invalidateTags([
      { type: 'Chat', id: data.chatId },
      { type: 'Chats', id: 'LIST' }
    ]));
  });

  socket.on('chat:created', (_data: { chatId: number; participantIds: number[] }) => {
    dispatch(messagesApi.util.invalidateTags([{ type: 'Chats', id: 'LIST' }]));
  });
};

// ==================== PUBLIC FUNCTIONS ====================

/**
 * Initializes or reconnects the WebSocket connection.
 * Registers event handlers only on first initialization.
 * 
 * @param token - Authentication token for the socket connection
 * @param dispatch - Redux dispatch function for store updates
 * @returns The active Socket instance or null if initialization failed
 */
export const initSocket = (token: string, dispatch: AppDispatch): Socket | null => {
  if (socket?.connected) {
    console.log('[Socket] Reusing active connection');
    return socket;
  }

  if (socket) {
    console.log('[Socket] Reconnecting existing instance');
    socket.connect();
    return socket;
  }

  console.log(`[Socket] Establishing new connection: ${SOCKET_URL}`);
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    extraHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!isInitialized) {
    registerSocketHandlers(socket, dispatch);
    isInitialized = true;
  }

  socket.on('connect_error', (err: Error) => {
    console.error('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason: string) => {
    console.log(`[Socket] Disconnected: ${reason}`);
  });

  return socket;
};

/**
 * Emits a join event for the specified chat room.
 * @param chatId - The ID of the chat room to join
 */
export const joinChatRoom = (chatId: number): void => {
  socket?.emit('chat:join', chatId);
};

/**
 * Emits a leave event for the specified chat room.
 * @param chatId - The ID of the chat room to leave
 */
export const leaveChatRoom = (chatId: number): void => {
  socket?.emit('chat:leave', chatId);
};

/**
 * Disconnects and cleans up the socket instance.
 * Resets initialization state to allow fresh reconnect.
 */
export const disconnectSocket = (): void => {
  if (socket) {
    console.log('[Socket] Disconnecting');
    socket.disconnect();
    socket = null;
    isInitialized = false;
  }
};

/**
 * Returns the current socket instance.
 * @returns The active Socket instance or null if not initialized
 */
export const getSocket = (): Socket | null => socket;
import { baseApi } from "@/app/store/api/baseApi";

export type MessageAuthor = {
  id: number;
  username: string;
  avatarUrl: string | null;
};

export type MessageData = {
  id: number;
  chatId: number;
  content: string;
  createdAt: string;
  isRead?: boolean;
  author: MessageAuthor;
};

export type ChatData = {
  chatId: number;
  chatName: string | null;
  isGroup: boolean;
  lastMessageAt: string | null;
  lastReadAt: string | null;
  unreadCount: number;
  lastMessage: {
    content: string;
    createdAt: string;
    author: {
      id: number;
      username: string;
      avatarUrl: string | null;
    };
  } | null;
  participant?: {
    userId: number;
    username: string;
    avatarUrl: string | null;
    isOnline: boolean;
  };
};

export type SendMessageInput = {
  chatId: number;
  content: string;
};

type ApiListResponse<T> = {
  message: string;
  data: T[];
  pagination: { limit: number; offset: number };
};

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<ChatData[], { limit?: number; offset?: number }>({
      query: ({ limit = 20, offset = 0 } = {}) => 
        `/api/messages/chats?limit=${limit}&offset=${offset}`,
      transformResponse: (response: ApiListResponse<ChatData>) => response.data,
      providesTags: (result) => 
        result 
          ? [
              { type: "Chats" as const, id: "LIST" },
              ...result.map(({ chatId }) => ({ type: "Chat" as const, id: chatId })),
            ]
          : [{ type: "Chats" as const, id: "LIST" }],
    }),

    getMessages: builder.query<MessageData[], { chatId: number; limit?: number; before?: string }>({
      query: ({ chatId, limit = 50, before }) => {
        const params = new URLSearchParams({ limit: limit.toString() });
        if (before) params.append("before", before);
        return `/api/messages/${chatId}?${params}`;
      },
      transformResponse: (response: ApiListResponse<MessageData>) => response.data,
      providesTags: (result, _error, { chatId }) => 
        result 
          ? [
              { type: "Messages" as const, id: `CHAT_${chatId}` },
              ...result.map(({ id }) => ({ type: "Message" as const, id })),
            ]
          : [{ type: "Messages" as const, id: `CHAT_${chatId}` }],
    }),

    sendMessage: builder.mutation<MessageData, SendMessageInput>({
      query: ({ chatId, content }) => ({
        url: "/api/messages/send",
        method: "POST",
        body: { chatId, content },
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Messages" as const, id: `CHAT_${chatId}` },
        { type: "Chats" as const, id: "LIST" },
      ],
    }),

    deleteChat: builder.mutation<
      { message: string; status: string },
      { chatId: number }
    >({
      query: ({ chatId }) => ({
        url: `/api/messages/chats/${chatId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Chat" as const, id: chatId },
        { type: "Chats" as const, id: "LIST" },
        { type: "Messages" as const, id: `CHAT_${chatId}` },
      ],
    }),

    createChat: builder.mutation<ChatData, { 
      participantIds: number[]; 
      isGroup?: boolean; 
      chatName?: string 
    }>({
      query: ({ participantIds, isGroup = false, chatName }) => ({
        url: "/api/messages/chats",
        method: "POST",
        body: { participantIds, isGroup, chatName },
      }),
      invalidatesTags: (result) => [
        { type: "Chats" as const, id: "LIST" },
        ...(result ? [{ type: "Chat" as const, id: result.chatId }] : []),
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetChatsQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteChatMutation,
  useCreateChatMutation,
} = messagesApi;
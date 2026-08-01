import { baseApi } from "@/app/store/api/baseApi";
import { env } from "@/shared/config/env";

export type MessageAuthor = {
  id: number;
  username: string;
  avatarUrl: string | null;
};

export type AttachmentKind = "image" | "file";

export type MessageAttachmentData = {
  id: number;
  messageId: number;
  chatId: number;
  kind: AttachmentKind;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  objectKey: string;
  createdAt: string;
};

export type MessageData = {
  id: number;
  chatId: number;
  content: string;
  createdAt: string;
  isRead?: boolean;
  author: MessageAuthor;
  attachments?: MessageAttachmentData[];
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

export type SendMessageAttachmentInput = {
  url: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  objectKey: string;
};

export type SendMessageInput = {
  chatId: number;
  content: string;
  attachments?: SendMessageAttachmentInput[];
};

export type MessageUploadUrlData = {
  uploadUrl: string;
  publicUrl: string;
  method: "PUT";
  headers: { "Content-Type": string };
  expiresIn: number;
  key: string;
};

type ApiListResponse<T> = {
  message: string;
  data: T[];
  pagination: { limit: number; offset: number };
};

type MessageUploadUrlDto = MessageUploadUrlData & {
  success?: boolean;
};

export const messagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChats: builder.query<ChatData[], { limit?: number; offset?: number }>({
      query: ({ limit = env.messages.defaultChatLimit, offset = 0 } = {}) =>
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

    getMessages: builder.query<
      MessageData[],
      { chatId: number; limit?: number; before?: string }
    >({
      query: ({ chatId, limit = env.messages.defaultMessageLimit, before }) => {
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
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(baseApi.util.invalidateTags([{ type: "Chats", id: "LIST" }]));
        } catch {
          // keep list cache on fetch error
        }
      },
    }),

    getMessageUploadUrl: builder.query<
      MessageUploadUrlData,
      { chatId: number; contentType?: string; fileName?: string; sizeBytes?: number }
    >({
      query: ({ chatId, contentType, fileName, sizeBytes }) => {
        const params = new URLSearchParams();
        if (contentType) params.set("contentType", contentType);
        if (fileName) params.set("fileName", fileName);
        if (sizeBytes != null) params.set("sizeBytes", String(sizeBytes));
        const qs = params.toString();
        return `/api/messages/chats/${chatId}/upload-url${qs ? `?${qs}` : ""}`;
      },
      transformResponse: (response: MessageUploadUrlDto): MessageUploadUrlData => ({
        uploadUrl: response.uploadUrl,
        publicUrl: response.publicUrl,
        method: response.method,
        headers: response.headers,
        expiresIn: response.expiresIn,
        key: response.key,
      }),
    }),

    getChatAttachments: builder.query<
      MessageAttachmentData[],
      { chatId: number; kind?: AttachmentKind; limit?: number; offset?: number }
    >({
      query: ({ chatId, kind, limit = 50, offset = 0 }) => {
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
        });
        if (kind) params.set("kind", kind);
        return `/api/messages/chats/${chatId}/attachments?${params}`;
      },
      transformResponse: (response: ApiListResponse<MessageAttachmentData>) =>
        response.data,
      providesTags: (_result, _error, { chatId, kind }) => [
        {
          type: "ChatAttachments" as const,
          id: kind ? `${chatId}_${kind}` : `CHAT_${chatId}`,
        },
      ],
    }),

    sendMessage: builder.mutation<MessageData, SendMessageInput>({
      query: ({ chatId, content, attachments }) => ({
        url: "/api/messages/send",
        method: "POST",
        body: { chatId, content, attachments },
      }),
      invalidatesTags: (_result, _error, { chatId }) => [
        { type: "Messages" as const, id: `CHAT_${chatId}` },
        { type: "Chats" as const, id: "LIST" },
        { type: "ChatAttachments" as const, id: `CHAT_${chatId}` },
        { type: "ChatAttachments" as const, id: `${chatId}_image` },
        { type: "ChatAttachments" as const, id: `${chatId}_file` },
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
        { type: "ChatAttachments" as const, id: `CHAT_${chatId}` },
        { type: "ChatAttachments" as const, id: `${chatId}_image` },
        { type: "ChatAttachments" as const, id: `${chatId}_file` },
      ],
    }),

    createChat: builder.mutation<
      ChatData,
      {
        participantIds: number[];
        isGroup?: boolean;
        chatName?: string;
      }
    >({
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
  useLazyGetMessageUploadUrlQuery,
  useGetChatAttachmentsQuery,
  useSendMessageMutation,
  useDeleteChatMutation,
  useCreateChatMutation,
} = messagesApi;

import { baseApi } from "@/app/store/api/baseApi";

/**
 * Представляет пользователя, отправившего уведомление.
 */
export type NotificationSender = {
  id: number;
  username: string;
  avatarUrl: string | null;
  bio?: string;
};

/**
 * Структура уведомления о заявке в друзья.
 */
export type FriendRequestNotification = {
  id: number;
  sender: NotificationSender;
  createdAt: string;
};

/**
 * Структура ответа API для получения уведомлений о заявках в друзья.
 */
export type NotificationsResponse = {
  requests: FriendRequestNotification[];
  total: number;
  unreadCount: number;
};

type IncomingFriendRequestDto = {
  id: number;
  fromUser: {
    id: number;
    name: string;
    avatarUrl: string | null;
    bio?: string | null;
  };
  createdAt: string;
};

type IncomingFriendRequestsResponseDto = {
  success?: boolean;
  requests: IncomingFriendRequestDto[];
  total: number;
};

const mapIncomingRequests = (
  response: IncomingFriendRequestsResponseDto
): NotificationsResponse => ({
  requests: response.requests.map((request) => ({
    id: request.id,
    sender: {
      id: request.fromUser.id,
      username: request.fromUser.name,
      avatarUrl: request.fromUser.avatarUrl,
      bio: request.fromUser.bio ?? undefined,
    },
    createdAt: request.createdAt,
  })),
  total: response.total,
  unreadCount: response.total,
});

/**
 * API-эндпоинты для работы с уведомлениями пользователя.
 */
export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Получает список pending-заявок в друзья и статистику уведомлений для текущего пользователя.
     * @returns Объект со списком заявок, общим количеством и числом непрочитанных уведомлений
     */
    getFriendRequests: builder.query<NotificationsResponse, void>({
      query: () => "/api/users/me/friends/requests/incoming",
      transformResponse: mapIncomingRequests,
      providesTags: ["Friends" as const],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFriendRequestsQuery } = notificationsApi;
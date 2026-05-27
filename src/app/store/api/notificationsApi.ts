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
      query: () => "/api/users/me/notifications/friend-requests",
      providesTags: ["Friends" as const],
    }),
  }),
  overrideExisting: false,
});

export const { useGetFriendRequestsQuery } = notificationsApi;
import { useGetFriendRequestsQuery } from "@/app/store/api"

/**
 * Хук для получения и обработки уведомлений о заявках в друзья
 * 
 * Преобразует данные RTK-запроса в удобный формат:
 * - Список заявок, общее количество и счётчик непрочитанных
 * - Унифицированную обработку состояний загрузки и ошибок
 * 
 * @returns Объект с данными, флагом загрузки, сообщением об ошибке и функцией refetch
 */
export const useGetNotifications = () => {
  const { data, isLoading, error, refetch } = useGetFriendRequestsQuery();

  return {
    requests: data?.requests || [],
    total: data?.total || 0,
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error: error ? "Не удалось загрузить уведомления" : null,
    refetch,
  };
};
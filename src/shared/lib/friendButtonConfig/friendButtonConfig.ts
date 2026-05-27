import { GetFriendButtonConfigParams, FriendButtonConfig } from "./lib"
import { FriendStatus } from "@/feature/friend/lib";

/**
 * Фабричная функция для конфигурации кнопки управления дружбой
 * 
 * Возвращает объект с настройками кнопки в зависимости от:
 * - Текущего статуса дружбы (none/pending/friends/blocked)
 * - Является ли пользователь подписчиком (isFollowing)
 * - Получает ли он заявку (isRequestReceiver)
 * - Состояния загрузки
 * - Переданных хендлеров действий
 * 
 * @param params - Параметры для генерации конфига
 * @returns Конфигурация кнопки для рендера
 */
export const getFriendButtonConfig = ({
  status,
  isFollowing,
  isRequestReceiver,
  isLoading,
  handlers,
}: GetFriendButtonConfigParams): FriendButtonConfig => {
  
  const { onAdd, onUnfollow, onCancel, onAccept, onDecline, onRemove } = handlers;

  const config: Record<FriendStatus, FriendButtonConfig> = {
    
    // Нет связи: показываем "Добавить" или "Отписаться"
    none: isFollowing 
      ? {
          text: "Отписаться",
          variant: "secondary",
          onClick: onUnfollow,
          disabled: isLoading,
          ariaLabel: "Отписаться от пользователя",
        }
      : {
          text: "Добавить в друзья",
          variant: "primary",
          onClick: onAdd,
          disabled: isLoading,
          ariaLabel: "Отправить заявку в друзья",
        },
    
    // Заявка отправлена: разные кнопки для отправителя и получателя
    pending: isRequestReceiver
      ? {
          text: "Принять заявку",
          variant: "success",
          onClick: onAccept,
          disabled: isLoading,
          ariaLabel: "Принять заявку в друзья",
          showSecondary: true,
          secondaryText: "Отклонить",
          secondaryVariant: "danger",
          secondaryOnClick: onDecline,
        }
      : {
          text: "Отписаться",
          variant: "secondary",
          onClick: onCancel,
          disabled: isLoading,
          ariaLabel: "Отменить заявку и отписаться",
        },
    
    // Друзья: кнопка удаления
    friends: {
      text: "В друзьях",
      variant: "success",
      onClick: onRemove,
      disabled: isLoading,
      ariaLabel: "Удалить из друзей",
    },
    
    // Заблокирован: неактивная кнопка
    blocked: {
      text: "Заблокирован",
      variant: "secondary",
      onClick: () => {},
      disabled: true,
      ariaLabel: "Пользователь заблокирован",
    },
  };

  return config[status];
};
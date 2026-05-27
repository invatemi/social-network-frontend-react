import { useState } from "react";
import { NotificationModal } from "../NotificationModal";
import { useGetNotifications } from "../../hooks/useGetNotifications";
import style from "./NotificationButton.module.css";

/**
 * NotificationButton — кнопка уведомлений
 * 
 * @description
 * Использует текстовые символы вместо эмодзи для строгого соблюдения 
 * визуального стиля терминала.
 * 
 * @returns JSX-элемент кнопки и модального окна уведомлений
 */
const NotificationButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { unreadCount } = useGetNotifications();

  return (
    <>
      <button 
        className={style.button}
        onClick={() => setIsOpen(true)}
        aria-label="Уведомления"
        aria-haspopup="dialog"
      >
        {/* Текстовая иконка вместо эмодзи */}
        <span className={style.icon}>{`[ ! ]`}</span>
        
        {unreadCount > 0 && (
          <span className={style.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default NotificationButton;
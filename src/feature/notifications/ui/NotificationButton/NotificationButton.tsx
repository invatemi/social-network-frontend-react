import { useState } from "react";
import { NotificationModal } from "../NotificationModal";
import { useGetNotifications } from "../../hooks/useGetNotifications";
import { AlertIcon } from "@/shared/ui/icons";
import style from "./NotificationButton.module.css";

/**
 * NotificationButton — кнопка уведомлений
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
        <AlertIcon size={18} className={style.icon} />

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

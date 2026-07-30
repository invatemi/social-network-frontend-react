import { Link } from "react-router-dom";
import { Button } from "@/shared";
import { FriendRequestNotification } from "@/app/store/api/notificationsApi";
import style from "./NotificationItem.module.css";

type NotificationItemProps = {
  request: FriendRequestNotification;
  onAccept: (requestId: number, senderId: number) => void;
  onDecline: (requestId: number, senderId: number) => void;
};

/**
 * NotificationItem — элемент уведомления
 */
const NotificationItem = ({ request, onAccept, onDecline }: NotificationItemProps) => {
  const { sender, createdAt } = request;

  const formattedTime = new Date(createdAt).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={style.item}>
      <Link to={`/user/${sender.id}`} className={style.sender}>
        <div className={style.avatarWrapper}>
          <img
            src={sender.avatarUrl || "/default-avatar.png"}
            alt={sender.username}
            className={style.avatar}
            loading="lazy"
          />
          <span className={style.avatarFallback}>{sender.username.charAt(0).toUpperCase()}</span>
        </div>
        <div className={style.info}>
          <span className={style.username}>@{sender.username}</span>
          {sender.bio && <span className={style.bio}>{sender.bio}</span>}
          <span className={style.time}>{formattedTime}</span>
        </div>
      </Link>

      <div className={style.actions}>
        <Button
          variant="success"
          size="sm"
          onClick={() => onAccept(request.id, sender.id)}
          aria-label="Принять заявку"
        >
          Принять
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => onDecline(request.id, sender.id)}
          aria-label="Отклонить заявку"
        >
          Отклонить
        </Button>
      </div>
    </div>
  );
};

export default NotificationItem;

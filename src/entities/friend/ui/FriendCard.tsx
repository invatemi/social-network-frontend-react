import { Link } from "react-router-dom";
import { useAppSelector } from "@/app/store/hooks";
import { FriendCardProps } from "../lib";
import style from "./FriendCard.module.css";

/**
 * FriendCard — карточка друга
 */
const FriendCard = ({
  id,
  username,
  avatarUrl,
  onMessageClick = () => {},
}: FriendCardProps) => {
  const isOnline = useAppSelector(
    (state) => state.presence.byUserId[String(id)] === true
  );

  const initial = username.charAt(0).toUpperCase();

  return (
    <div className={style.card}>
      <Link to={`/user/${id}`} className={style.avatarLink} aria-label={username}>
        <div className={style.avatarWrapper}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className={style.avatar}
              loading="lazy"
            />
          ) : (
            <div className={style.avatarPlaceholder}>{initial}</div>
          )}
          <span
            className={[style.onlineDot, isOnline ? style.online : style.offline]
              .filter(Boolean)
              .join(" ")}
            aria-label={isOnline ? "Онлайн" : "Офлайн"}
            title={isOnline ? "Онлайн" : "Офлайн"}
          />
        </div>
      </Link>

      <div className={style.info}>
        <Link to={`/user/${id}`} className={style.username}>
          {username}
        </Link>
        <button
          type="button"
          className={style.messageBtn}
          onClick={() => onMessageClick(id)}
          aria-label={`Написать сообщение пользователю ${username}`}
        >
          Написать сообщение
          <span className={style.messageIcon} aria-hidden />
        </button>
      </div>
    </div>
  );
};

export default FriendCard;

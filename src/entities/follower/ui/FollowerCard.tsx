import { Link } from "react-router-dom";
import { Button } from "@/shared";
import { FollowerCardProps } from "../lib";
import style from "./FollowerCard.module.css";

/**
 * FollowerCard — карточка подписчика
 */
const FollowerCard = ({ id, username, avatarUrl, followedSince, onMessageClick }: FollowerCardProps) => {
  const formattedDate = new Date(followedSince).toLocaleDateString("ru-RU");

  return (
    <div className={style.card}>
      <Link to={`/user/${id}`} className={style.link}>
        <div className={style.avatarWrapper}>
          <img 
            src={avatarUrl || "/default-avatar.png"}
            alt={username} 
            className={style.avatar} 
            loading="lazy"
          />
          <span className={style.avatarFallback}>{username.charAt(0).toUpperCase()}</span>
        </div>

        <div className={style.info}>
          <span className={style.username}>{`@${username}`}</span>
          <span className={style.since}>{`[followed: ${formattedDate}]`}</span>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          onMessageClick?.(id);
        }}
        className={style.actionBtn}
        aria-label={`Написать сообщение пользователю ${username}`}
      >
        {`[message]`}
      </Button>
    </div>
  );
};

export default FollowerCard;
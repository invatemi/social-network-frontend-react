import { Link } from "react-router-dom";
import { Button } from "@/shared";
import { FriendCardProps } from "../lib";
import style from "./FriendCard.module.css";

/**
 * FriendCard — карточка друга
 */
const FriendCard = ({ 
  id, 
  username, 
  avatarUrl, 
  friendsSince, 
  onMessageClick = () => {}
}: FriendCardProps) => {
  
  const formattedDate = new Date(friendsSince).toLocaleDateString("ru-RU");
  
  const handleMessageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onMessageClick(id);
  };

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
          <span className={style.since}>{`[friends: ${formattedDate}]`}</span>
        </div>
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleMessageClick}
        className={style.actionBtn}
        aria-label={`Написать сообщение пользователю ${username}`}
      >
        {`[message]`}
      </Button>
    </div>
  );
};

export default FriendCard;
import { Link } from "react-router-dom";
import { CreateFriend } from "@/feature";
import type { SearchUser } from "@/entities/search-user/lib";
import style from "./PeopleSearchCard.module.css";

export type PeopleSearchCardProps = {
  user: SearchUser;
  currentUserId?: number;
};

/**
 * PeopleSearchCard — карточка пользователя из глобального поиска на /friends
 */
const PeopleSearchCard = ({ user, currentUserId }: PeopleSearchCardProps) => {
  const initial = user.username.charAt(0).toUpperCase();

  return (
    <div className={style.card}>
      <Link
        to={`/user/${user.id}`}
        className={style.avatarLink}
        aria-label={user.username}
      >
        <div className={style.avatarWrapper}>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className={style.avatar}
              loading="lazy"
            />
          ) : (
            <div className={style.avatarPlaceholder}>{initial}</div>
          )}
        </div>
      </Link>

      <div className={style.info}>
        <Link to={`/user/${user.id}`} className={style.username}>
          @{user.username}
        </Link>
        {user.bio ? <span className={style.bio}>{user.bio}</span> : null}
      </div>

      <div className={style.action}>
        <CreateFriend
          targetUserId={user.id}
          initialStatus="none"
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
};

export default PeopleSearchCard;

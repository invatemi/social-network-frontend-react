import { SearchUserCardProps } from "../lib";
import style from "./SearchUserCard.module.css";

/**
 * SearchUserCard — карточка пользователя
 */
const SearchUserCard = ({ user, onClick }: SearchUserCardProps) => {
  const initial = user.username.charAt(0).toUpperCase();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
  };

  return (
    <div 
      className={style.userCard} 
      onMouseDown={handleMouseDown}
    >
      <div className={style.avatarWrapper}>
        {user.avatarUrl ? (
          <img 
            src={user.avatarUrl} 
            alt={user.username} 
            className={style.avatar}
            draggable={false}
          />
        ) : (
          <div className={style.avatarPlaceholder}>{`[${initial}]`}</div>
        )}
      </div>
      
      <div className={style.userInfo}>
        <span className={style.username}>{`@${user.username}`}</span>
        {user.bio && <span className={style.bio}>{`// ${user.bio}`}</span>}
      </div>
    </div>
  );
};

export default SearchUserCard;
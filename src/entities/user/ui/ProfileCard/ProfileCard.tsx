import { Link } from "react-router-dom";
import { ProfileCardProps } from "../../lib";
import style from "./ProfileCard.module.css";

/**
 * ProfileCard — карточка профиля
 */
const ProfileCard = ({ 
  avatarUrl, 
  username, 
  bio, 
  initial, 
  isEditable, 
  isOnline = false 
}: ProfileCardProps) => {
  return (
    <div className={`${style.card} ${style.cardProfile}`}>
      <div className={style.profileHeader}>
        <div className={style.avatarContainer}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={username} className={style.avatar} />
          ) : (
            <div className={style.avatarPlaceholder}>{`[${initial}]`}</div>
          )}
          <span className={`${style.statusBadge} ${isOnline ? style.online : style.offline}`}>
            {isOnline ? `[ON]` : `[OFF]`}
          </span>
        </div>
        
        <div className={style.profileInfo}>
          <h1 className={style.name}>{`@${username}`}</h1>
        </div>
      </div>
      
      <p className={style.bio}>{bio ? `// ${bio}` : "// NO_BIO_DATA"}</p>

      <div className={style.profileActions}>
        {isEditable && (
          <Link to="/user/settings" className={style.btnEdit}>
            {`[EDIT_PROFILE]`}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProfileCard
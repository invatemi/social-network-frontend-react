import { useNavigate } from "react-router-dom";
import { StatsCardProps } from "../../lib";
import style from "./StatsCard.module.css";

/**
 * StatsCard — карточка статистики
 */
const StatsCard = ({ 
  postsCount, 
  followersCount, 
  followingCount,
  targetUserId 
}: StatsCardProps) => {
  const navigate = useNavigate();

  const handleFriendsClick = () => {
    const path = targetUserId ? `/friends/${targetUserId}` : '/friends';
    navigate(path);
  };

  const handleFollowersClick = () => {
    const path = targetUserId ? `/followers/${targetUserId}` : '/followers';
    navigate(path);
  };

  return (
    <div className={`${style.card} ${style.cardStats}`}>
      <div className={style.statItem}>
        <span className={style.statValue}>{`[POSTS]`}</span>
        <span className={style.statLabel}>{postsCount ?? 0}</span>
      </div>

      <div 
        className={`${style.statItem} ${style.clickable}`} 
        onClick={handleFollowersClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleFollowersClick()}
      >
        <span className={style.statValue}>{`[FOLLOWERS]`}</span>
        <span className={style.statLabel}>{followersCount ?? 0}</span>
      </div>

      <div 
        className={`${style.statItem} ${style.clickable}`} 
        onClick={handleFriendsClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleFriendsClick()}
      >
        <span className={style.statValue}>{`[FRIENDS]`}</span>
        <span className={style.statLabel}>{followingCount ?? 0}</span>
      </div>
    </div>
  );
};

export default StatsCard
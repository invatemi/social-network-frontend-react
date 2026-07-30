import { FollowerCard } from "@/entities";
import { FollowerListProps } from "../lib";
import style from "./FollowerList.module.css";

/**
 * FollowerList — список подписчиков
 */
const FollowerList = ({
  followers,
  onMessageClick,
  emptyTitle = "Нет подписок",
}: FollowerListProps) => {
  if (followers.length === 0) {
    return (
      <div className={style.empty}>
        <p className={style.emptyTitle}>{emptyTitle}</p>
        <span className={style.emptyHint}>Попробуйте изменить поиск или фильтр</span>
      </div>
    );
  }

  return (
    <div className={style.list}>
      {followers.map((follower) => (
        <FollowerCard
          key={follower.id}
          {...follower}
          onMessageClick={onMessageClick}
        />
      ))}
    </div>
  );
};

export default FollowerList;

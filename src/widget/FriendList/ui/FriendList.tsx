import { FriendCard } from "@/entities";
import { FriendListProps } from "../lib";
import style from "./FriendList.module.css";

/**
 * FriendList — список друзей
 */
const FriendList = ({ friends, onMessageClick, emptyTitle = "Нет друзей" }: FriendListProps) => {
  if (friends.length === 0) {
    return (
      <div className={style.empty}>
        <p className={style.emptyTitle}>{emptyTitle}</p>
        <span className={style.emptyHint}>Попробуйте изменить поиск или фильтр</span>
      </div>
    );
  }

  return (
    <div className={style.list}>
      {friends.map((friend) => (
        <FriendCard
          key={friend.id}
          {...friend}
          onMessageClick={onMessageClick}
        />
      ))}
    </div>
  );
};

export default FriendList;

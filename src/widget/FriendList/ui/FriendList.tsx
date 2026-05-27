import { FriendCard } from "@/entities";
import { FriendListProps } from "../lib";
import style from "./FriendList.module.css";

/**
 * FriendList — список друзей
 */
const FriendList = ({ friends }: FriendListProps) => {
  if (friends.length === 0) {
    return (
      <div className={style.empty}>
        <span className={style.emptyIcon}>{`[∅]`}</span>
        <p>{`// no_friends`}</p>
        <span className={style.emptyHint}>{`> use_search_to_find_people`}</span>
      </div>
    );
  }

  return (
    <div className={style.grid}>
      {friends.map((friend) => (
        <FriendCard key={friend.id} {...friend} />
      ))}
    </div>
  );
};

export default FriendList;
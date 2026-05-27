import { FollowerCard } from "@/entities";
import { FollowerListProps } from "../lib";
import style from "./FollowerList.module.css";

/**
 * FollowerList — список подписчиков
 */
const FollowerList = ({ followers }: FollowerListProps) => {
  if (followers.length === 0) {
    return (
      <div className={style.empty}>
        <span className={style.emptyIcon}>{`[∅]`}</span>
        <p>{`// no_followers`}</p>
        <span className={style.emptyHint}>{`> publish_content_to_attract`}</span>
      </div>
    );
  }

  return (
    <div className={style.grid}>
      {followers.map((follower) => (
        <FollowerCard key={follower.id} {...follower} />
      ))}
    </div>
  );
};

export default FollowerList;
import { FriendList } from "@/widget";
import type { FriendItem } from "@/widget/FriendList/lib";
import type { SearchUser } from "@/entities/search-user/lib";
import { PeopleSearchCard } from "../PeopleSearchCard";
import style from "./FriendsSearchResults.module.css";

export type FriendsSearchResultsProps = {
  friends: FriendItem[];
  otherUsers: SearchUser[];
  isOthersLoading: boolean;
  onMessageClick?: (userId: number) => void;
  currentUserId?: number;
  friendsEmptyTitle?: string;
};

/**
 * FriendsSearchResults — два блока: друзья по запросу + остальные пользователи
 */
const FriendsSearchResults = ({
  friends,
  otherUsers,
  isOthersLoading,
  onMessageClick,
  currentUserId,
  friendsEmptyTitle = "Нет друзей по запросу",
}: FriendsSearchResultsProps) => {
  return (
    <div className={style.root} data-testid="friends-search-results">
      <section
        className={style.section}
        aria-labelledby="friends-search-friends-heading"
        data-testid="friends-search-friends"
      >
        <h2 id="friends-search-friends-heading" className={style.heading}>
          Друзья
          <span className={style.count}>{friends.length}</span>
        </h2>
        <FriendList
          friends={friends}
          onMessageClick={onMessageClick}
          emptyTitle={friendsEmptyTitle}
        />
      </section>

      <section
        className={style.section}
        aria-labelledby="friends-search-others-heading"
        data-testid="friends-search-others"
      >
        <h2 id="friends-search-others-heading" className={style.heading}>
          Другие пользователи
          {!isOthersLoading ? (
            <span className={style.count}>{otherUsers.length}</span>
          ) : null}
        </h2>

        {isOthersLoading ? (
          <div className={style.status} data-testid="friends-search-others-loading">
            Поиск пользователей…
          </div>
        ) : otherUsers.length === 0 ? (
          <div className={style.status} data-testid="friends-search-others-empty">
            Никого не найдено
          </div>
        ) : (
          <div className={style.list}>
            {otherUsers.map((user, index) => (
              <div
                key={user.id}
                className={style.row}
                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
              >
                <PeopleSearchCard user={user} currentUserId={currentUserId} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default FriendsSearchResults;

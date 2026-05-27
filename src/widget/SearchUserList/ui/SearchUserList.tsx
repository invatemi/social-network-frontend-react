import { useNavigate } from "react-router-dom";
import { SearchUserCard } from "@/entities";
import { SearchUserListProps } from "../lib";
import style from "./SearchUserList.module.css";

/**
 * SearchUserList — список результатов поиска
 */
const SearchUserList = ({ users, onSelect }: SearchUserListProps) => {
  const navigate = useNavigate();

  const handleUserClick = (userId: number) => {
    onSelect();
    
    if (!userId || isNaN(userId)) {
      console.error("[SearchUserList] Invalid userId:", userId);
      return;
    }
    
    const path = `/user/${userId}`;
    navigate(path);
  };

  return (
    <div className={style.userList}>
      {users.map((user) => (
        <SearchUserCard
          key={user.id}
          user={user}
          onClick={() => handleUserClick(user.id)}
        />
      ))}
    </div>
  );
};

export default SearchUserList;
import { useEffect } from "react";
import { Input, Spinner, SearchIcon } from "@/shared/ui";
import { SearchUserList } from "@/widget";
import { useUserSearch } from "../hooks";
import style from "./SearchInput.module.css";

/**
 * SearchInput — поле поиска
 */
const SearchInput = () => {
  const { query, setQuery, isOpen, isLoading, users, handleClose, handleSelect } = useUserSearch();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`.${style.searchContainer}`)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClose]);

  return (
    <div className={style.searchContainer}>
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={handleClose}
        placeholder="Поиск пользователей..."
        leftIcon={<SearchIcon size={16} />}
        rightIcon={isLoading ? <Spinner size="sm" color="secondary" label="" /> : undefined}
        className={style.searchInput}
        fullWidth
        autoComplete="off"
      />

      {isOpen && users.length > 0 && (
        <div className={style.dropdown}>
          <div className={style.dropdownHeader}>
            Найдено: {users.length}
          </div>
          <SearchUserList users={users} onSelect={handleSelect} />
        </div>
      )}

      {isOpen && !isLoading && query.length >= 2 && users.length === 0 && (
        <div className={style.dropdown}>
          <div className={style.empty}>Никого не найдено</div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;

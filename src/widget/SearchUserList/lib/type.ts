import { SearchUser } from "@/entities/search-user/lib";

export type SearchUserListProps = {
  users: SearchUser[];
  onSelect: () => void;
};
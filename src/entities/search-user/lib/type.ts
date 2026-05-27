/**
 * Представляет пользователя в результатах поиска.
 */
export type SearchUser = {
  id: number;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
};

/**
 * Структура ответа API при поиске пользователей.
 */
export type SearchResponse = {
  users: SearchUser[];
};

export type SearchUserCardProps = {
  user: SearchUser;
  onClick: () => void;
};
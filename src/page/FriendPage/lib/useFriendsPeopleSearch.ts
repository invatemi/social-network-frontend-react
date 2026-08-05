import { useEffect, useMemo, useState } from "react";
import { useSearchUsersQuery } from "@/entities/search-user/api";
import type { SearchUser } from "@/entities/search-user/lib";
import { env } from "@/shared/config/env";

export type UseFriendsPeopleSearchOptions = {
  enabled: boolean;
  currentUserId?: number;
  friendIds: number[];
};

export type UseFriendsPeopleSearchReturn = {
  debouncedQuery: string;
  isSearchActive: boolean;
  otherUsers: SearchUser[];
  isOthersLoading: boolean;
};

/**
 * useFriendsPeopleSearch — debounce + глобальный поиск людей на своей /friends
 */
export const useFriendsPeopleSearch = (
  query: string,
  { enabled, currentUserId, friendIds }: UseFriendsPeopleSearchOptions
): UseFriendsPeopleSearchReturn => {
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, env.search.debounceMs);

    return () => clearTimeout(timer);
  }, [query]);

  const isSearchActive =
    enabled && debouncedQuery.length >= env.search.minQueryLength;

  const { data, isLoading, isFetching } = useSearchUsersQuery(
    { query: debouncedQuery },
    { skip: !isSearchActive }
  );

  const excludeIds = useMemo(() => {
    const ids = new Set(friendIds);
    if (currentUserId !== undefined) ids.add(currentUserId);
    return ids;
  }, [currentUserId, friendIds]);

  const otherUsers = useMemo(() => {
    if (!isSearchActive) return [];
    return (data?.users ?? []).filter((user) => !excludeIds.has(user.id));
  }, [data?.users, excludeIds, isSearchActive]);

  return {
    debouncedQuery,
    isSearchActive,
    otherUsers,
    isOthersLoading: isSearchActive && (isLoading || isFetching),
  };
};

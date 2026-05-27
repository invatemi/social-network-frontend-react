import { useState, useEffect, useCallback } from "react";
import { useSearchUsersQuery } from "@/entities/search-user/api";

/**
 * Хук useUserSearch
 * 
 * Управляет поиском пользователей:
 * - Debounce ввода (300ms)
 * - Запрос к API при изменении запроса
 * - Управление видимостью результатов
 * - Очистка при закрытии
 * 
 * @returns Объект с состояниями поиска и методами управления
 */
export const useUserSearch = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading } = useSearchUsersQuery(
    { query: debouncedQuery },
    { 
      skip: debouncedQuery.length < 2, // Минимум 2 символа
    }
  );

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
  }, []);

  const handleSelect = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
  }, []);

  return {
    query,
    setQuery: handleQueryChange,
    isOpen,
    isLoading,
    users: data?.users || [],
    handleClose,
    handleSelect,
  };
};
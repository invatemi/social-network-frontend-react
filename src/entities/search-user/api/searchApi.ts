import { baseApi } from "@/app/store/api/baseApi";
import { SearchResponse } from "../lib";

/**
 * API-эндпоинты для поиска пользователей по имени или логину.
 */
export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Выполняет поиск пользователей по текстовому запросу.
     * 
     * @param query - Строка поиска (имя, логин или часть имени)
     * @returns Объект `SearchResponse` со списком найденных пользователей
     * 
     * @caching
     * - `keepUnusedDataFor: 30` — данные поиска не кэшируются дольше 30 секунд,
     *   так как результаты динамические и могут часто меняться
     */
    searchUsers: builder.query<SearchResponse, { query: string }>({
      query: ({ query }) => ({
        url: "/api/users/search",
        params: { q: query },
      }),
      keepUnusedDataFor: 30,
    }),
    
  }),
  overrideExisting: false,
});

export const {
  useSearchUsersQuery,
} = searchApi;
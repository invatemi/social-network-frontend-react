import { baseApi } from "@/app/store/api/baseApi";
import { SearchResponse, SearchUser } from "../lib";

type SearchUserDto = {
  id: number;
  name: string;
  email?: string;
  avatarUrl?: string | null;
  bio?: string | null;
};

type SearchDtoResponse = {
  success?: boolean;
  users?: SearchUserDto[];
  results?: SearchUserDto[];
  total?: number;
  nextCursor?: string | null;
};

const mapSearchUser = (user: SearchUserDto): SearchUser => ({
  id: user.id,
  username: user.name,
  avatarUrl: user.avatarUrl ?? null,
  bio: user.bio ?? null,
});

const mapSearchResponse = (response: SearchDtoResponse): SearchResponse => ({
  users: (response.users ?? response.results ?? []).map(mapSearchUser),
  total: response.total,
  nextCursor: response.nextCursor ?? null,
  hasMore: Boolean(response.nextCursor),
});

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
    searchUsers: builder.query<
      SearchResponse,
      { query: string; limit?: number; cursor?: string | null }
    >({
      query: ({ query, limit, cursor }) => ({
        url: "/api/users/search",
        params: {
          q: query,
          ...(limit ? { limit } : {}),
          ...(cursor ? { cursor } : {}),
        },
      }),
      transformResponse: mapSearchResponse,
      keepUnusedDataFor: 30,
    }),
    
  }),
  overrideExisting: false,
});

export const {
  useSearchUsersQuery,
} = searchApi;
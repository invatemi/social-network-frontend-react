import { 
  fetchBaseQuery, 
  BaseQueryFn, 
  FetchArgs, 
  FetchBaseQueryError 
} from "@reduxjs/toolkit/query/react";
import { authStore } from "@/app/provider";
import { env } from "@/shared/config/env";

/**
 * Базовый RTK Query fetchBaseQuery с конфигурацией авторизации.
 * 
 * @description
 * - Добавляет Bearer-токен в заголовки запросов из Redux store или persistent storage
 * - Пропускает авторизацию для публичных эндпоинтов (например, `searchUsers`)
 * - Предупреждает в консоль при отсутствии токена (для отладки)
 */
const baseQuery = fetchBaseQuery({
  baseUrl: env.apiUrl,
  prepareHeaders: (headers, { getState, endpoint }) => {
    if (endpoint === "searchUsers") {
      return headers;
    }
    
    const state = getState() as { auth: { accessToken: string | null } };
    const token = state.auth.accessToken || authStore.getAccessToken();
    
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

/**
 * Кастомный baseQuery с автоматическим обновлением токена доступа.
 * 
 * @description
 * Перехватывает ответы с кодом `401`, пытается обновить пару токенов через
 * `/api/auth/refresh`, сохраняет новые токены в Redux и persistent storage,
 * затем повторяет исходный запрос. При неудаче рефреша выполняет логаут.
 * 
 * @param args - Аргументы запроса (строка URL или объект FetchArgs)
 * @param api - RTK Query API-объект (dispatch, getState, signal и др.)
 * @param extraOptions - Дополнительные опции для fetchBaseQuery
 * @returns Результат выполнения запроса или повторной попытки
 */
export const customBaseQuery: BaseQueryFn<
  string | FetchArgs, 
  unknown, 
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error?.status === 401) {
    const refreshToken = authStore.getRefreshToken();
    
    if (refreshToken) {
      try {
        const refreshResult = await fetchBaseQuery({
          baseUrl: env.apiUrl,
        })(
          { 
            url: "/api/auth/refresh", 
            method: "POST", 
            body: { refreshToken },
            headers: { "Content-Type": "application/json" }
          },
          api,
          extraOptions
        );
        
        if (refreshResult.data && !refreshResult.error) {
          const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as {
            accessToken: string;
            refreshToken: string;
          };
          
          api.dispatch({
            type: "auth/setTokens",
            payload: { accessToken, refreshToken: newRefreshToken },
          });
          authStore.save({ accessToken, refreshToken: newRefreshToken });
          
          result = await baseQuery(args, api, extraOptions);
        } else {
          api.dispatch({ type: "auth/logout" });
        }
      } catch {
        api.dispatch({ type: "auth/logout" });
      }
    } else {
      api.dispatch({ type: "auth/logout" });
    }
  }
  
  return result;
};
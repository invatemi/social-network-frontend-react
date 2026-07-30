import { createApi } from "@reduxjs/toolkit/query/react";
import { customBaseQuery } from "../lib/updateToken";

/**
 * Базовый RTK Query API-инстанс для всего приложения.
 * 
 * @description
 * Содержит общую конфигурацию для всех эндпоинтов:
 * - `reducerPath` — ключ для подключения редьюсера к store
 * - `baseQuery` — кастомная функция запроса с обработкой токенов
 * - `tagTypes` — список тегов для инвалидации кэша
 * 
 * @example
 * // Подключение к store (app/store/index.ts)
 * import { baseApi } from '@/shared/api/baseApi';
 * 
 * export const store = configureStore({
 *   reducer: {
 *     [baseApi.reducerPath]: baseApi.reducer,
 *     // ...другие редьюсеры
 *   },
 *   middleware: (getDefaultMiddleware) =>
 *     getDefaultMiddleware().concat(baseApi.middleware),
 * });
 */
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: customBaseQuery,
  tagTypes: [
    "User", 
    "Posts", 
    "Comments", 
    "Auth", 
    "Friends", 
    "Feed", 
    "UserOnline", 
    "FriendStatus", 
    "UserMe",
    "Chat",
    "Chats",
    "Messages",
    "Message",
    "Photos",
    "PhotoComments",
  ],
  endpoints: () => ({}),
});
import { baseApi } from "./baseApi";
import { UserProfile } from "@/entities/user/lib";

/**
 * API-эндпоинты для аутентификации и авторизации пользователей.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Аутентификация пользователя по логину и паролю.
     * @param credentials - Объект с учетными данными пользователя
     * @param credentials.username - Имя пользователя или email
     * @param credentials.password - Пароль пользователя
     * @returns Объект с токенами доступа и данными профиля
     */
    login: builder.mutation<
      { accessToken: string; refreshToken: string; user: UserProfile }, 
      { email: string; password: string }
    >({
      query: (body) => ({ 
        url: "/api/auth/login",
        method: "POST", 
        body 
      }),
      invalidatesTags: ["User", "Auth"],
    }),
    
    /**
     * Регистрация нового пользователя.
     * @param credentials - Данные для регистрации
     * @param credentials.username - Имя пользователя
     * @param credentials.email - Email пользователя
     * @param credentials.password - Пароль
     * @returns Объект с токенами доступа и данными профиля
     */
    register: builder.mutation<
      { accessToken: string; refreshToken: string; user: UserProfile }, 
      { username: string; email: string; password: string }
    >({
      query: (body) => ({ 
        url: "/api/auth/register",
        method: "POST", 
        body 
      }),
      invalidatesTags: ["User", "Auth"],
    }),
    
    /**
     * Выход из системы.
     * @returns Объект с сообщением об успехе
     */
    logout: builder.mutation<{ message: string }, { refreshToken: string }>({
      query: (body) => ({
        url: "/api/auth/logout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User", "Auth"],
    }),
    
    /**
     * Обновление пары токенов доступа (access/refresh).
     * @param credentials - Объект с текущим refresh-токеном
     * @param credentials.refreshToken - Действующий refresh-токен
     * @returns Объект с новыми токенами
     */
    refreshTokens: builder.mutation<
      { accessToken: string; refreshToken: string },
      { refreshToken: string }
    >({
      query: (body) => ({ 
        url: "/api/auth/refresh", 
        method: "POST", 
        body 
      }),
    }),
    
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokensMutation,
  useLogoutMutation,
} = authApi;
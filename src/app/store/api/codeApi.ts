import { baseApi } from "./baseApi";

/**
 * API-эндпоинты для работы с кодами восстановления пароля.
 */
export const codeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Запрашивает код восстановления пароля на email пользователя.
     * @returns Объект с подтверждением отправки и email получателя
     */
    requestPasswordCode: builder.mutation<
      { message: string; email: string }, 
      void
    >({
      query: () => ({ 
        url: "/api/auth/password/request", 
        method: "POST", 
        body: {} 
      }),
    }),
    
    /**
     * Проверяет код восстановления и устанавливает новый пароль.
     * @param credentials - Данные для сброса пароля
     * @param credentials.code - Код подтверждения из письма
     * @param credentials.newPassword - Новый пароль пользователя
     * @returns Объект с сообщением об успехе
     */
    verifyPasswordCode: builder.mutation<
      { message: string }, 
      { code: string; newPassword: string }
    >({
      query: (body) => ({ 
        url: "/api/auth/password/verify", 
        method: "POST", 
        body 
      }),
    }),
    
  }),
  overrideExisting: false,
});

export const {
  useRequestPasswordCodeMutation,
  useVerifyPasswordCodeMutation,
} = codeApi;
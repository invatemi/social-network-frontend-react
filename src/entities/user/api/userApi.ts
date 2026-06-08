import { UserProfile } from "../lib";
import { baseApi } from "@/app/store/api/baseApi";
import type { RootState } from "@/app/store/types";
import { updateUser } from "@/app/store/slices/authSlice";

/**
 * Структура ответа API при обновлении профиля пользователя.
 */
type UpdateProfileResponse = {
  message: string;
  user: UserProfile;
};

/**
 * API-эндпоинты для работы с профилями пользователей: получение, обновление, аватар, статус онлайн.
 */
export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    
    /**
     * Получает профиль текущего авторизованного пользователя.
     * 
     * @returns Объект `UserProfile` с данными профиля
     * 
     * @tagging
     * - `providesTags`: ["User", "UserMe"] — позволяет инвалидировать кэш как по общему тегу, так и по личному
     */
    getUserProfile: builder.query<UserProfile, void>({
      query: () => "/api/users/me",
      providesTags: ["User", "UserMe"],
    }),
    
    /**
     * Получает публичный профиль указанного пользователя по ID.
     * 
     * @param userId - Уникальный идентификатор пользователя
     * @returns Объект `UserProfile` с публичными данными профиля
     * 
     * @tagging
     * - `providesTags`: [{ type: 'User', id: userId }] — точечная инвалидация по конкретному пользователю
     */
    getUserPublicProfile: builder.query<UserProfile, { userId: number }>({
      query: ({ userId }) => `/api/users/${userId}`,
      providesTags: (result, error, { userId }) => 
        [{ type: 'User' as const, id: userId }],
    }),

    /**
     * Обновляет данные профиля текущего пользователя.
     * 
     * @param profile - Частичные данные профиля для обновления (`Partial<UserProfile>`)
     * @returns Объект с сообщением об успехе и обновлённым профилем
     * 
     * @sideEffects
     * - Диспатчит `updateUser` в Redux store для синхронизации состояния
     * - Инвалидирует тег "User" для обновления зависимых запросов
     */
    updateUserProfile: builder.mutation<UpdateProfileResponse, Partial<UserProfile>>({
      query: (body) => ({ 
        url: "/api/users/me", 
        method: "PUT", 
        body 
      }),
      invalidatesTags: ["User"],
      
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const user = data.user;
          
          if (user) {
            dispatch(updateUser(user));
          }
        } catch {
          // Ошибка обработки мутации обрабатывается на уровне компонента
        }
      },
    }),
    
    /**
     * Загружает новый аватар для текущего пользователя.
     * 
     * @param formData - Объект FormData с файлом аватара
     * @returns Объект с новым URL аватара
     * 
     * @sideEffects
     * - Диспатчит `updateUser` с новым `avatarUrl` для мгновенного обновления UI
     * - Инвалидирует тег "User" для обновления зависимых запросов
     */
    uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
      query: (formData) => ({
        url: "/api/users/me/avatar",
        method: "POST",
        body: formData,
        headers: {},
      }),
      invalidatesTags: ["User"],
      
      async onQueryStarted(_, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          
          const state = getState() as RootState;
          const currentUser = state.auth.user;
          
          if (currentUser) {
            dispatch(updateUser({ 
              avatarUrl: data.avatarUrl 
            }));
          }
        } catch (err: unknown) {
          console.error("[userApi] Avatar sync failed:", err);
        }
      }
    }),
    
    /**
     * Подтверждает текущий пароль пользователя для выполнения чувствительных действий.
     * 
     * @param credentials - Объект с паролем
     * @param credentials.password - Текущий пароль пользователя
     * @returns Объект с сообщением об успехе
     */
    confirmPassword: builder.mutation<{ message: string }, { password: string }>({
      query: (body) => ({ url: "/api/users/me/confirm", method: "POST", body }),
    }),
    
    /**
     * Уведомляет сервер об изменении email пользователя (после подтверждения нового адреса).
     * 
     * @param data - Объект с новым email
     * @param data.newEmail - Новый подтверждённый email пользователя
     * @returns Объект с сообщением об успехе
     */
    notifyEmailChanged: builder.mutation<{ message: string }, { newEmail: string }>({
      query: (body) => ({ url: "/api/users/me/email-changed", method: "POST", body }),
    }),

    /**
     * Получает статус онлайн-присутствия указанного пользователя.
     * 
     * @param userId - Уникальный идентификатор пользователя
     * @returns Объект с флагом `online: boolean`
     * 
     * @tagging
     * - `providesTags`: [{ type: 'UserOnline', id: userId }] — точечная инвалидация статуса онлайн
     */
    getUserOnlineStatus: builder.query<{ online: boolean }, { userId: number }>({
      query: ({ userId }) => `/api/users/${userId}/online`,
      providesTags: (result, error, { userId }) => 
        [{ type: 'UserOnline' as const, id: userId }],
    }),
    
  }),
  overrideExisting: false,
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useUploadAvatarMutation,
  useConfirmPasswordMutation,
  useNotifyEmailChangedMutation,
  useGetUserPublicProfileQuery,
  useGetUserOnlineStatusQuery
} = userApi;
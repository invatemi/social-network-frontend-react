import { UserProfile } from "../lib";
import { baseApi } from "@/app/store/api/baseApi";
import type { AppDispatch } from "@/app/store/types";
import { updateUser } from "@/app/store/slices/authSlice";

type UserDto = {
  id: number;
  name?: string;
  username?: string;
  email: string;
  avatarUrl?: string | null;
  bio?: string | null;
  location?: string | null;
  createdAt?: string;
  postsCount?: number;
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
  friendStatus?: UserProfile["friendStatus"];
  friendRequestFrom?: number | null;
  isOnline?: boolean;
};

type UserProfileResponseDto = UserDto | {
  success?: boolean;
  user: UserDto;
};

type UpdateProfileRequest = Partial<
  Pick<UserProfile, "username" | "email" | "avatarUrl" | "bio" | "location">
>;

type UpdateProfileDtoResponse = {
  success?: boolean;
  message?: string;
  user: UserDto;
  changedFields?: string[];
};

/**
 * Структура ответа API при обновлении профиля пользователя.
 */
type UpdateProfileResponse = {
  message: string;
  user: UserProfile;
  changedFields: string[];
};

type AvatarUploadUrlDtoResponse = {
  success?: boolean;
  uploadUrl: string;
  publicUrl: string;
  method: "PUT";
  headers: { "Content-Type": string };
  expiresIn: number;
  key: string;
};

export type AvatarUploadUrlData = Omit<AvatarUploadUrlDtoResponse, "success">;

const isWrappedUserResponse = (
  response: UserProfileResponseDto
): response is { success?: boolean; user: UserDto } => "user" in response;

const normalizeUserProfile = (user: UserDto): UserProfile => ({
  id: user.id,
  username: user.username ?? user.name ?? user.email,
  email: user.email,
  avatarUrl: user.avatarUrl ?? null,
  bio: user.bio ?? "",
  location: user.location ?? "",
  memberSince: user.createdAt,
  postsCount: user.postsCount ?? 0,
  followersCount: user.followersCount ?? 0,
  followingCount: user.followingCount ?? user.friendsCount ?? 0,
  friendsCount: user.friendsCount,
  friendStatus: user.friendStatus,
  friendRequestFrom: user.friendRequestFrom ?? undefined,
  isOnline: user.isOnline ?? false,
});

const mapProfileResponse = (response: UserProfileResponseDto): UserProfile => {
  const user = isWrappedUserResponse(response) ? response.user : response;
  return normalizeUserProfile(user);
};

const toUpdateProfileBody = (profile: UpdateProfileRequest) => ({
  ...(profile.username !== undefined ? { name: profile.username } : {}),
  ...(profile.email !== undefined ? { email: profile.email } : {}),
  ...(profile.avatarUrl !== undefined ? { avatarUrl: profile.avatarUrl } : {}),
  ...(profile.bio !== undefined ? { bio: profile.bio } : {}),
  ...(profile.location !== undefined ? { location: profile.location } : {}),
});

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
      transformResponse: mapProfileResponse,
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
      transformResponse: mapProfileResponse,
      providesTags: (_result, _error, { userId }) => 
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
    updateUserProfile: builder.mutation<UpdateProfileResponse, UpdateProfileRequest>({
      query: (profile) => ({ 
        url: "/api/users/me", 
        method: "PATCH", 
        body: toUpdateProfileBody(profile),
      }),
      transformResponse: (response: UpdateProfileDtoResponse) => ({
        message: response.message ?? "Profile updated",
        user: normalizeUserProfile(response.user),
        changedFields: response.changedFields ?? [],
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
     * Получает presigned URL для прямой загрузки аватара в MinIO.
     */
    getAvatarUploadUrl: builder.query<
      AvatarUploadUrlData,
      { contentType: string; fileName?: string }
    >({
      query: ({ contentType, fileName }) => {
        const params = new URLSearchParams({ contentType });
        if (fileName) {
          params.set("fileName", fileName);
        }
        return `/api/users/me/avatar-upload-url?${params.toString()}`;
      },
      transformResponse: (response: AvatarUploadUrlDtoResponse): AvatarUploadUrlData => ({
        uploadUrl: response.uploadUrl,
        publicUrl: response.publicUrl,
        method: response.method,
        headers: response.headers,
        expiresIn: response.expiresIn,
        key: response.key,
      }),
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
      providesTags: (_result, _error, { userId }) => 
        [{ type: 'UserOnline' as const, id: userId }],
    }),
    
  }),
  overrideExisting: false,
});

export const {
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useLazyGetAvatarUploadUrlQuery,
  useConfirmPasswordMutation,
  useNotifyEmailChangedMutation,
  useGetUserPublicProfileQuery,
  useGetUserOnlineStatusQuery
} = userApi;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Загружает профиль текущего пользователя с повторными попытками
 * (eventual consistency после регистрации через RabbitMQ).
 */
export const fetchUserProfileWithRetry = async (
  dispatch: AppDispatch,
  maxAttempts = 3,
  delayMs = 400
): Promise<UserProfile | null> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await dispatch(
        userApi.endpoints.getUserProfile.initiate(undefined, { forceRefetch: true })
      ).unwrap();
    } catch {
      if (attempt === maxAttempts) {
        return null;
      }

      await sleep(delayMs);
    }
  }

  return null;
};
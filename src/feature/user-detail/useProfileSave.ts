import { useState } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { updateUser } from "@/app/store/slices/authSlice";

import {
  useUpdateUserProfileMutation,
  useLazyGetAvatarUploadUrlQuery,
} from "@/entities/user/api/userApi";

import { UserProfile } from "@/entities/user/lib";
import { uploadAvatarToStorage } from "./uploadAvatarFile";

type SaveProfileParams = {
  username: string;
  email: string;
  bio: string;
  location: string;
  avatarFile: File | null;
  isProfileChanged: boolean;
  currentUser: UserProfile | null;
};

type UseProfileSaveReturn = {
  isSaving: boolean;
  saveError: string | null;
  saveSuccess: string | null;
  saveProfile: (params: SaveProfileParams) => Promise<boolean>;
  clearMessages: () => void;
};

/**
 * Хук useProfileSave
 *
 * Управляет сохранением профиля пользователя:
 * - Загрузка аватара через presigned URL в MinIO
 * - Обновление имени/почты/био/локации через мутацию
 * - Обработка ошибок и статусов
 */
export const useProfileSave = (): UseProfileSaveReturn => {
  const dispatch = useAppDispatch();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [updateProfile] = useUpdateUserProfileMutation();
  const [getAvatarUploadUrl] = useLazyGetAvatarUploadUrlQuery();

  const clearMessages = () => {
    setSaveError(null);
    setSaveSuccess(null);
  };

  const saveProfile = async ({
    username,
    email,
    bio,
    location,
    avatarFile,
    isProfileChanged,
    currentUser,
  }: SaveProfileParams) => {
    if (!isProfileChanged && !avatarFile) {
      setSaveError("Нет изменений для сохранения");
      return false;
    }

    setIsSaving(true);
    clearMessages();

    try {
      let avatarUrl: string | undefined;

      if (avatarFile) {
        avatarUrl = await uploadAvatarToStorage(avatarFile, (args) =>
          getAvatarUploadUrl(args).unwrap()
        );
      }

      if (isProfileChanged || avatarUrl) {
        const result = await updateProfile({
          ...(isProfileChanged ? { username, email, bio, location } : {}),
          ...(avatarUrl ? { avatarUrl } : {}),
        }).unwrap();

        if (currentUser) {
          dispatch(updateUser({ ...currentUser, ...result.user }));
        }
      }

      setSaveSuccess("Профиль успешно обновлён");
      return true;
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveError(err?.data?.message || err.message || "Ошибка при сохранении");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    saveError,
    saveSuccess,
    saveProfile,
    clearMessages,
  };
};
